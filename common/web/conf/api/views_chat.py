# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


# _____________________________________ Include for [///] _____________________________________

import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from users.login_required import login_required

# _____________________________________ Include for models apps _____________________________________

from django.contrib.auth.models import User
from users.models import Player
from game.models import Game, PongCustomGame, AIPlayer
from chat.models import Friends, Messages, GameInvitation, Notification

# _____________________________________ Include Utils _____________________________________

from itertools import chain
from django.db.models import Q
from django.db.models import Count
from django.db import DatabaseError


# ======================================================================================================================
# ================================================= CHAT Methode  ======================================================
# ======================================================================================================================


# _____________________________________ Chat Users _____________________________________


@csrf_exempt
@api_view(['GET'])
@login_required
def getChatUser(request):
    """
        Retrieve chat users for the logged-in player and their notification counts.
        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            Response: A list of chat users with their IDs, usernames, images, online status, 
                        and notification counts, or an error message with an appropriate status code.
    """
    try:
        player = Player.objects.get(username=request.user)
        friends = Friends.objects.filter(player_id=player.id, status=3).select_related('friend')
        friends_ids = friends.values_list('friend_id', flat=True)
        chat_users = Player.objects.filter(id__in=friends_ids).annotate(
            notif_count=Count('notif_recipient', filter=Q(notif_recipient__type__in=[1, 2], notif_recipient__recipient=player))
        ).values('id', 'username', 'img', 'is_online', 'notif_count')
        return Response(list(chat_users), status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except DatabaseError as db_error:
        return Response({"error": f"Database error: {db_error}"}, status=500)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# _____________________________________ Chat Messages _____________________________________


@csrf_exempt
@api_view(['GET'])
@login_required
def getMessages(request):
    """
        Retrieve chat messages and game invitations between the logged-in user and a specified contact.
        Args:
            request (HttpRequest): The HTTP request object containing the contactId.
        Returns:
            Response: A list of messages and game invitations between the users, or an error message 
                    with an appropriate status code.
        Raises:
            Player.DoesNotExist: If either the logged-in user or the specified contact does not exist.
            DatabaseError: If there is a database-related error during the operation.
    """
    try:
        player = Player.objects.get(username=request.user)
        friend = Player.objects.get(id=request.GET.get('contactId'))
        messages_sent, messages_received = get_messages_between_players(player, friend)
        game_invitations = get_game_invitations(player, friend)
        combined_list = annotate_messages_and_invitations(messages_sent, messages_received, game_invitations)
        return Response(combined_list, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except DatabaseError as db_error:
        return Response({"message": f"Database error: {str(db_error)}"}, status=500)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

def get_messages_between_players(player, friend):
    """
        Fetch messages sent by and received from a friend.
        Args:
            player (Player): The player sending the messages.
            friend (Player): The player receiving the messages.
        Returns:
            tuple: A tuple containing two QuerySets:
                - messages_sent: Messages sent by the player to the friend.
                - messages_received: Messages sent by the friend to the player.
    """
    messages_sent = Messages.objects.filter(sender=player, receiver=friend).values('sender', 'content', 'created_at')
    messages_received = Messages.objects.filter(sender=friend, receiver=player).values('sender', 'content', 'created_at')
    return messages_sent, messages_received

def get_game_invitations(player, friend):
    """
        Fetch game invitations sent between two players.
        Args:
            player (Player): The player sending the invitations.
            friend (Player): The player receiving the invitations.
        Returns:
            QuerySet: A QuerySet of game invitations sent from the player to the friend.
    """
    return GameInvitation.objects.filter(player1=player, player2=friend).values('player1', 'player2', 'status', 'created_at')

def annotate_messages_and_invitations(messages_sent, messages_received, game_invitations):
    """
        Combine and annotate messages and game invitations.
        Args:
            messages_sent (QuerySet): Messages sent by the player.
            messages_received (QuerySet): Messages received by the player.
            game_invitations (QuerySet): Game invitations sent by the player.
        Returns:
            list: A combined and annotated list of messages and invitations, sorted by creation date.
    """    
    combined_list = list(chain(
        *[
            [{"sender": message['sender'], "content": message['content'], "created_at": message['created_at'], "type": 0} for message in messages_sent],
            [{"player1": invitation['player1'], "player2": invitation['player2'], "status": invitation['status'], "created_at": invitation['created_at'], "type": 1, "content": f"Game invitation from {invitation['player1']} to {invitation['player2']}"} for invitation in game_invitations],
            [{"sender": message['sender'], "content": message['content'], "created_at": message['created_at'], "type": 0} for message in messages_received],
        ]
    ))
    combined_list.sort(key=lambda x: x['created_at'])
    return combined_list


@csrf_exempt
@api_view(['POST'])
@login_required
def sendMessage(request):
    """
        Send a message to a specified contact.
        Args:
            request (HttpRequest): The HTTP request object containing the contactId and message.
        Returns:
            JsonResponse: A success message if the message is sent successfully, 
                            or an error message with an appropriate status code.
        Raises:
            Player.DoesNotExist: If either the logged-in user or the specified contact does not exist.
            DatabaseError: If there is a database-related error during the operation.
    """
    try:
        player = Player.objects.get(username=request.user)
        friend = Player.objects.get(id=request.data.get('contactId'))
        if not validate_friendship(player, friend):
            return JsonResponse({"message": "You are not friends with this user."}, status=205)
        create_message(player, friend, request.data.get('message'))
        create_chat_message_notification(player, friend)
        return JsonResponse({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return JsonResponse({"message": "One of the players does not exist."}, status=404)
    except DatabaseError as db_error:
        return JsonResponse({"message": f"Database error: {str(db_error)}"}, status=500)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

def create_message(sender, receiver, content):
    """
        Create a new message.
        Args:
            sender (Player): The player sending the message.
            receiver (Player): The player receiving the message.
            content (str): The content of the message.
        Returns:
            Messages: The created message object.
    """
    return Messages.objects.create(sender=sender, receiver=receiver, content=content)

def create_chat_message_notification(sender, recipient):
    """
        Create a new notification for a new message.
        Args:
            sender (Player): The player sending the message.
            recipient (Player): The player receiving the notification.
        Returns:
            Notification: The created notification object.
    """
    Notification.objects.create(sender=sender, type=1, recipient=recipient, content=f"New message from {sender.username}")


# _____________________________________ Chat GameInvite _____________________________________


@csrf_exempt
@api_view(['POST'])
@login_required
def sendGameInvite(request):
    """
        Send a game invitation to a specified contact.
        Args:
            request (HttpRequest): The HTTP request object containing the contactId.
        Returns:
            Response: A success message if the game invitation is sent successfully, 
                        or an error message with an appropriate status code.
        Raises:
            Player.DoesNotExist: If either the logged-in user or the specified contact does not exist.
    """
    try:        
        player = Player.objects.get(username=request.user)
        friend = Player.objects.get(id=request.data.get('contactId'))
        if not validate_friendship(player, friend):
            return JsonResponse({"message": "You are not friends with this user."}, status=205)
        clear_existing_invitations(player, friend)
        new_game = create_game(player, friend)
        create_game_invitations(player, friend, new_game)
        create_game_invite_notification(player, friend, f"Game invitation from {player.username}")
        return Response({"message": "Invitation sent successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

def validate_friendship(player, friend):
    """
        Check if the players are friends.
        Args:
            player (Player): The player initiating the check.
            friend (Player): The player to check friendship status with.
        Returns:
            bool: True if the players are friends (with a status of 3), False otherwise.
    """
    return Friends.objects.filter(player_id=player.id, friend_id=friend.id, status=3).exists()

def clear_existing_invitations(player, friend):
    """
		Delete existing game invitations and associated games between two players.
		Args:
			player (Player): The first player.
			friend (Player): The second player.
		This function checks for existing game invitations in both directions (player to friend and friend to player).
		If an invitation is found, the associated game (if any) will also be deleted.
    """
    for p1, p2 in [(player, friend), (friend, player)]:
        invitation = GameInvitation.objects.filter(player1=p1, player2=p2).first()
        if invitation:
            game_id = invitation.game_id.UUID
            if Game.objects.filter(UUID=game_id).exists():
                Game.objects.filter(UUID=game_id).delete()
            invitation.delete()

def create_game(player, friend):
    """
		Create a new game between two players.
		Args:
			player (Player): The player who initiates the game.
			friend (Player): The player who is invited to the game.
		Returns:
			Game: The newly created Game instance.
    """
    return Game.objects.create(
        player1=player,
        player2=friend,
        elo_before_player1=player.eloPong,
        elo_before_player2=friend.eloPong,
        elo_after_player1=None,
        elo_after_player2=None,
        finish=False,
        type='pongPv',
    )

def create_game_invitations(player, friend, game):
    """
		Create game invitations for both players.
		Args:
			player (Player): The player who initiates the invitation.
			friend (Player): The invited player.
			game (Game): The game associated with the invitations.
		This function creates two invitations: one from player to friend and another from friend to player.
    """
    GameInvitation.objects.bulk_create([
        GameInvitation(player1=player, player2=friend, status=0, game_id=game),
        GameInvitation(player1=friend, player2=player, status=1, game_id=game)
    ])

def create_game_invite_notification(sender, recipient, content):
    """
		Create a notification for a game invitation.
		Args:
			sender (Player): The player sending the notification.
			recipient (Player): The player receiving the notification.
			content (str): The content of the notification.
		Returns:
			Notification: The newly created Notification instance.
    """
    return Notification.objects.create(sender=sender, type=2, recipient=recipient, content=content)


@api_view(['POST'])
@login_required
def updateGameInviteStatus(request):
    """
		Update the status of a game invitation between two players.
		Args:
			request (HttpRequest): The HTTP request object containing the invitation details.
		Returns:
			Response: A success message if the status is updated, or an error message with an appropriate status code.
    """
    try:
        player = Player.objects.get(username=request.user)
        friend = Player.objects.get(id=request.data.get('contactId'))
        status = request.data.get('status')
        update_game_invitation_status(player, friend, status)
        return Response({"message": "Status updated successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def update_game_invitation_status(player, friend, status):
    """
		Update the game invitation status between the player and their friend.
		Args:
			player (Player): The player object.
			friend (Player): The friend object.
			status (int): The new status for the game invitation.
    """
    if status == 2:
        update_status_for_both_invites(player, friend, 2)
    elif status == -1:
        update_status_for_both_invites(player, friend, -2)

def update_status_for_both_invites(player, friend, new_status):
    """
		Update the invitation status for both players.
		Args:
			player (Player): The player object.
			friend (Player): The friend object.
			new_status (int): The new status to set for the invitations.
    """
    GameInvitation.objects.filter(player1=friend, player2=player).update(status=new_status)
    GameInvitation.objects.filter(player1=player, player2=friend).update(status=new_status)


# ======================================================================================================================
# ================================================ Social Methode  =====================================================
# ======================================================================================================================


# _____________________________________ Social Users _____________________________________


@csrf_exempt
@api_view(['GET'])
@login_required
def getSocialUser(request):
    """
		Retrieve a list of social users for the logged-in player, excluding blocked users.
		Args:
			request (HttpRequest): The HTTP request object.
		Returns:
			Response: A list of social users with their IDs, usernames, images, online status,
						friend status, and notification flags, or an error message with an appropriate status code.
    """
    try:
        player = Player.objects.get(username=request.user)
        blocked_users = get_blocked_users(player.id)
        social_users = get_social_users(player.id, blocked_users)
        all_social_notifications = get_all_social_notifications(player)
        social_users_list = [
            build_social_user_data(social_user, player.id, all_social_notifications) for social_user in social_users
        ]
        sorted_social_users = sort_social_users(social_users_list)
        return Response(sorted_social_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def get_blocked_users(player_id):
    """
		Get a list of blocked users for the given player.
		Args:
			player_id (int): The ID of the player.
		Returns:
			list: A list of user IDs that the player has blocked.
    """
    return list(Friends.objects.filter(player_id=player_id, status=-3).values_list('friend_id', flat=True))

def get_social_users(player_id, blocked_users):
    """
		Get social users for the given player, excluding blocked users.
		Args:
			player_id (int): The ID of the player.
			blocked_users (list): A list of user IDs that are blocked.
		Returns:
			QuerySet: A QuerySet of social users' data.
    """
    return Player.objects.exclude(id__in=blocked_users).exclude(id=player_id).values('id', 'username', 'img')

def get_all_social_notifications(player):
    """
		Retrieve all social notifications for the given player.
		Args:
			player (Player): The player object.
		Returns:
			QuerySet: A QuerySet of notification data.
    """
    return Notification.objects.filter(
        Q(type=3) | Q(type=4),
        recipient=player
    ).values('sender__id', 'type', 'content', 'created_at')

def build_social_user_data(social_user, player_id, notifications):
    """
		Build a dictionary of social user data, including online status, friend status, and notification flag.
		Args:
			social_user (dict): A dictionary containing social user information.
			player_id (int): The ID of the logged-in player.
			notifications (QuerySet): A QuerySet of notifications to check against.
		Returns:
			dict: A dictionary containing enriched social user data.
    """
    social_user_data = social_user
    social_user_data['is_online'] = Player.objects.get(id=social_user['id']).is_online
    social_user_data['friend_status'] = getFriendStatus(player_id, social_user['id'])
    social_user_data['notif'] = 1 if any(notif['sender__id'] == social_user['id'] for notif in notifications) else 0
    return social_user_data

def sort_social_users(social_users_list):
    """
		Sort social users based on their friendship status.
		Args:
			social_users_list (list): A list of social user data.
		Returns:
			list: A sorted list of social users.
    """
    priority = {2: 0, 1: 1, 0: 2, 3: 3, -2: 4, -1: 5}
    return sorted(social_users_list, key=lambda x: priority[x['friend_status']])

def getFriendStatus(player_id, friend_id):
    """
		Get the friendship status between two players.
		Args:
			player_id (int): The ID of the player.
			friend_id (int): The ID of the friend.
		Returns:
			int: The friendship status, or 0 if they are not friends.
    """
    try:
        f = Friends.objects.get(player_id=player_id, friend_id=friend_id)
        return f.status
    except Friends.DoesNotExist:
        return 0


# _____________________________________ Social Update Relation  _____________________________________


@csrf_exempt
@api_view(['POST'])
@login_required
def updateSocialStatus(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        SocialUser = request.data.get('socialUserId')
        friend_status = request.data.get('friendStatus')
        try:
            friend_status = int(friend_status)
        except ValueError:
            return Response({"error": "friend_status doit être un entier"}, status=400)
        try:
            SocialUser = int(SocialUser)
        except ValueError:
            return Response({"error": "socialUserId doit être un entier"}, status=400)
        if friend_status == 0:
            if Friends.objects.filter(player_id=player.id, friend_id=SocialUser).exists():
                Friends.objects.filter(player_id=player.id, friend_id=SocialUser).delete()
            if Friends.objects.filter(player_id=SocialUser, friend_id=player.id).exists():
                Friends.objects.filter(player_id=SocialUser, friend_id=player.id).delete()
            Friends.objects.create(player_id=player.id, friend_id=SocialUser, status=1)
            Friends.objects.create(player_id=SocialUser, friend_id=player.id, status=2)
        elif friend_status == 2:
            Friends.objects.filter(player_id=player.id, friend_id=SocialUser).update(status=3)
            Friends.objects.filter(player_id=SocialUser, friend_id=player.id).update(status=3)
        elif friend_status == -1:
            clearChatNotif = Notification.objects.filter(sender=player, recipient=Player.objects.get(id=SocialUser), type=1)
            clearChatNotif.delete()
            clearChatNotif = Notification.objects.filter(sender=Player.objects.get(id=SocialUser), recipient=player, type=1)
            clearChatNotif.delete()
            if Friends.objects.filter(player_id=player.id, friend_id=SocialUser).exists():
                Friends.objects.filter(player_id=player.id, friend_id=SocialUser).delete()
            if Friends.objects.filter(player_id=SocialUser, friend_id=player.id).exists():
                Friends.objects.filter(player_id=SocialUser, friend_id=player.id).delete()
        elif friend_status == -2:
            clearChatNotif = Notification.objects.filter(sender=player, recipient=Player.objects.get(id=SocialUser), type=1)
            clearChatNotif.delete()
            clearChatNotif = Notification.objects.filter(sender=Player.objects.get(id=SocialUser), recipient=player, type=1)
            clearChatNotif.delete()
            Friends.objects.filter(player_id=player.id, friend_id=SocialUser).update(status=-1)
            Friends.objects.filter(player_id=SocialUser, friend_id=player.id).update(status=-3)
        if friend_status == 0:
            Notification.objects.create(sender=player, type=3, recipient=Player.objects.get(id=SocialUser), content=f"Friend request from {player.username}")
        elif friend_status == 2:
            Notification.objects.create(sender=player, type=4, recipient=Player.objects.get(id=SocialUser), content=f"{player.username} accepted your friend request")
        return Response({"message": "Status updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)



# ======================================================================================================================
# =============================================== ChatNotif Methode  ===================================================
# ======================================================================================================================


# _____________________________________ Notif Actions  _____________________________________


@csrf_exempt
@api_view(['GET'])
@login_required
def getGlobalNotif(request):
    """
		Retrieves all notifications for a player.
		Args:
			request: The HTTP request containing the logged-in user's information.
		Returns:
			Response: A response containing the player's notifications.
    """
    try:
        player = Player.objects.get(username=request.user.username)
        notifications = Notification.objects.filter(recipient=player).values(
            'sender__id', 'type', 'content', 'created_at'
        ).order_by('-created_at')
        
        return Response(notifications, status=200)
    except Exception as e:
        return handle_exception(e)

@api_view(['GET'])
@login_required
def getNbrChatNotif(request):
    """
		Retrieves the total number of chat notifications for a player.
		Args:
			request: The HTTP request containing the logged-in user's information.
		Returns:
			Response: A message containing the number of notifications.
    """
    try:
        player = Player.objects.get(username=request.user.username)
        notifications_count = count_notifications(player, [1, 2])
        return Response({"nbrNotif": notifications_count}, status=200)
    except Exception as e:
        return handle_exception(e)

@api_view(['GET'])
@login_required
def getNbrSocialNotif(request):
    """
		Retrieves the total number of social notifications for a player.
		Args:
			request: The HTTP request containing the logged-in user's information.
		Returns:
			Response: A message containing the number of notifications.
    """
    try:
        player = Player.objects.get(username=request.user.username)
        notifications_count = count_notifications(player, [3, 4])
        return Response({"nbrNotif": notifications_count}, status=200)
    except Exception as e:
        return handle_exception(e)

@api_view(['GET'])
@login_required
def clearNotifSocial(request):
    """
		Clears all social notifications for a player.
		Args:
			request: The HTTP request containing the logged-in user's information.
		Returns:
			Response: A success or error message.
    """
    try:
        player = Player.objects.get(username=request.user.username)
        delete_notifications_type(player, [3, 4])
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Exception as e:
        return handle_exception(e)

@api_view(['GET'])
@login_required
def clearNotifChatForUser(request):
    """
		Clears all chat notifications for a specific user.
		Args:
			request: The HTTP request containing the logged-in user's information.
		Returns:
			Response: A success or error message.
    """
    try:
        player = Player.objects.get(username=request.user.username) 

        chat_user = get_player_by_id(request.GET.get('userId'))
        delete_notifications_between(chat_user, player, [1, 2])
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Exception as e:
        return handle_exception(e)

# _____________________________________ Notif Utils  _____________________________________


def get_player_by_id(user_id):
    """Retrieves the player object from the user ID."""
    return Player.objects.get(id=user_id)

def count_notifications(player, types):
    """Counts the number of notifications for a player by type."""
    return sum(Notification.objects.filter(recipient=player, type=type).count() for type in types)

def delete_notifications_type(player, types):
    """Deletes notifications for a player by type."""
    for type in types:
        Notification.objects.filter(recipient=player, type=type).delete()

def delete_notifications_between(sender, recipient, types):
    """Deletes notifications between two players by type."""
    for type in types:
        Notification.objects.filter(sender=sender, recipient=recipient, type=type).delete()

def handle_exception(e):
    """Handles exceptions and returns an appropriate error message."""
    if isinstance(e, Player.DoesNotExist):
        return Response({"error": "Player does not exist"}, status=404)
    return Response({"error": str(e)}, status=500)