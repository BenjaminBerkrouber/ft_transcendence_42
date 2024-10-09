# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


# _____________________________________ Standard Library Imports _____________________________________


import requests


# _____________________________________ Django Imports _____________________________________


from django.db.models import Count, Q
from django.db import DatabaseError
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


# _____________________________________ Third-Party Imports _____________________________________


from rest_framework.response import Response
from rest_framework.decorators import api_view
from itertools import chain


# _____________________________________ Local Application Imports _____________________________________


from users.login_required import login_required
from chat.models import Messages, GameInvitation, Notification, Friends
BASE_URL = "https://172.17.0.1"


# ======================================================================================================================
# ================================================= CHAT Methode  ======================================================
# ======================================================================================================================

import logging
logger = logging.getLogger('print')


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
        playerId = request.GET.get('userId')
        friends = Friends.objects.filter(player_id=playerId, status=3).values_list('friend_id', flat=True)
        if not friends:
            return Response([], status=200)
        chat_users = _fetch_users_data(friends)
        user_ids = list(chat_users.keys())
        notification_counts = {}
        if user_ids:
            notifications = (
                Notification.objects.filter(recipient_id__in=user_ids, type__in=[1, 2])
                .values('recipient_id')
                .annotate(notif_count=Count('id'))
            )
            notification_counts = {notif['recipient_id']: notif['notif_count'] for notif in notifications}
        for user_id, user_data in chat_users.items():
            user_data['notif_count'] = notification_counts.get(user_id, 0)
        return Response(list(chat_users.values()), status=200)
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
        playerId = request.GET.get('userId')
        friendId = request.GET.get('contactId')
        messages_sent, messages_received = _get_messages_between_players(playerId, friendId)
        game_invitations = _get_game_invitations(playerId, friendId)
        combined_list = _annotate_messages_and_invitations(messages_sent, messages_received, game_invitations)
        return Response(combined_list, status=200)
    except DatabaseError as db_error:
        return Response({"message": f"Database error: {str(db_error)}"}, status=500)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

def _get_messages_between_players(playerId, friendId):
    """
        Fetch messages exchanged between two players.
        Args:
            playerId (int): The ID of the sending player.
            friendId (int): The ID of the receiving player.
        Returns:
            tuple: A tuple containing two QuerySets:
                - messages_sent (QuerySet): Messages sent by the player.
                - messages_received (QuerySet): Messages received from the friend.
                Each QuerySet includes:
                - sender_id (int): The sender's ID.
                - content (str): The message content.
                - created_at (datetime): Timestamp of message creation.
        Raises:
            Exception: Logs error and returns empty lists if an error occurs.
    """
    try:
        messages_sent = Messages.objects.filter(sender_id=playerId, receiver_id=friendId).values('sender_id', 'content', 'created_at')
        messages_received = Messages.objects.filter(sender_id=friendId, receiver_id=playerId).values('sender_id', 'content', 'created_at')
        return messages_sent, messages_received
    except Exception as e:
        logger.error(f"Error _get_messages_between_players: {e}")
        return [], []

def _get_game_invitations(playerId, friendId):
    """
        Fetch game invitations sent from a player to a friend.
        Args:
            playerId (int): The ID of the player sending the invitations.
            friendId (int): The ID of the friend receiving the invitations.
        Returns:
            QuerySet: A QuerySet of game invitations with the following fields:
                - player1_id (int): The ID of the player sending the invitation.
                - player2_id (int): The ID of the friend receiving the invitation.
                - status (int): The current status of the invitation.
                - created_at (datetime): Timestamp of when the invitation was created.
    """
    gameinv = GameInvitation.objects.filter(player1_id=playerId, player2_id=friendId).values('player1_id', 'player2_id', 'status', 'created_at')
    return gameinv

def _annotate_messages_and_invitations(messages_sent, messages_received, game_invitations):
    """
        Combine and annotate sent messages, received messages, and game invitations.
        Args:
            messages_sent (QuerySet): Messages sent by the player.
            messages_received (QuerySet): Messages received by the player.
            game_invitations (QuerySet): Game invitations sent by the player.
        Returns:
            list: A combined and annotated list of messages and invitations, sorted by creation date. 
                Each entry includes:
                    - sender (int): ID of the message sender (type 0).
                    - content (str): Content of the message or invitation.
                    - created_at (datetime): Timestamp of the message or invitation.
                    - type (int): Type identifier (0 for messages, 1 for invitations).
                    - player1 (int): ID of the player sending the invitation (for invitations).
                    - player2 (int): ID of the invited player (for invitations).
                    - status (int): Current status of the invitation (for invitations).
    """
    combined_list = list(chain(
        *[
            [{"sender": message['sender_id'], "content": message['content'], "created_at": message['created_at'], "type": 0} for message in messages_sent],
            [{"player1": invitation['player1_id'], "player2": invitation['player2_id'], "status": invitation['status'], "created_at": invitation['created_at'], "type": 1, "content": f"Game invitation from {invitation['player1_id']} to {invitation['player2_id']}"} for invitation in game_invitations],
            [{"sender": message['sender_id'], "content": message['content'], "created_at": message['created_at'], "type": 0} for message in messages_received],
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
        playerId = request.data.get('userId')
        friendId = request.data.get('contactId')
        if not _validate_friendship(playerId, friendId):
            return JsonResponse({"message": "You are not friends with this user."}, status=205)
        _create_message(playerId, friendId, request.data.get('message'))
        _create_chat_message_notification(playerId, friendId)
        return JsonResponse({"message": "Message sent successfully"}, status=200)
    except DatabaseError as db_error:
        return JsonResponse({"message": f"Database error: {str(db_error)}"}, status=500)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

def _create_message(senderId, receiverId, content):
    """
        Create a new message.
        Args:
            senderId (int): ID of the player sending the message.
            receiverId (int): ID of the player receiving the message.
            content (str): The content of the message.
        Returns:
            Messages: The created message object.
    """
    return Messages.objects.create(sender_id=senderId, receiver_id=receiverId, content=content)

def _create_chat_message_notification(senderId, receiverId):
    """
        Create a new notification for a new message.
        Args:
            senderId (int): ID of the player sending the message.
            receiverId (int): ID of the player receiving the notification.
        Returns:
            Notification: The created notification object.
    """
    Notification.objects.create(sender_id=senderId, type=1, recipient_id=receiverId, content=f"New message from {senderId}")


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
        playerId = request.data.get('userId')
        contactId = request.data.get('contactId')
        if not _validate_friendship(playerId, contactId):
            return JsonResponse({"message": "You are not friends with this user."}, status=205)
        _clear_existing_invitations(playerId, contactId)
        newGame = _create_game(playerId, contactId)
        if not newGame:
            return JsonResponse({"message": "Error creating game"}, status=205)
        _create_game_invitations(playerId, contactId, newGame)
        _create_game_invite_notification(playerId, contactId, f"Game invitation from {playerId}")
        return Response({"message": "Invitation sent successfully"}, status=200)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

def _validate_friendship(playerId, friendId):
    """
        Check if the players are friends.
        Args:
            playerId (int): ID of the player initiating the check.
            friendId (int): ID of the player to check friendship status with.
        Returns:
            bool: True if the players are friends (with a status of 3), False otherwise.
    """
    return Friends.objects.filter(player_id=playerId, friend_id=friendId, status=3).exists()

def _clear_existing_invitations(playerId, contactId):
    """
        Delete existing game invitations and associated games between two players.
        Args:
            playerId (int): ID of the first player.
            contactId (int): ID of the second player.
        This function checks for existing game invitations in both directions 
        (player to friend and friend to player). If an invitation is found, 
        the associated game (if any) will also be deleted.
    """
    try:
        invitations = GameInvitation.objects.filter(player1_id=playerId, player2_id=contactId)
        invitations2 = GameInvitation.objects.filter(player1_id=contactId, player2_id=playerId)
        invitations = list(chain(invitations, invitations2))
        for invitation in invitations:
            _remove_game_by_id(invitation.gameUUID)
            invitation.delete()
    except Exception as e:
        logger.error(f"Error _clear_existing_invitations: {e}")

def _create_game(playerId, contactId):
    """
        Create a new game between two players.
        Args:
            playerId (int): ID of the player initiating the game.
            contactId (int): ID of the player being invited to the game.
        Returns:
            Game: The newly created Game instance or None if an error occurs.
    """
    try:
        newGameUUID = _create_game_api(playerId, contactId, 'pongPv')
        return newGameUUID
    except Exception as e:
        logger.error(f"Error _create_game: {e}")
        return None

def _create_game_invitations(playerId, friendId, newGameUUID):
    """
        Create game invitations for both players.
        Args:
            playerId (int): ID of the player who initiates the invitation.
            friendId (int): ID of the invited player.
            newGameUUID (UUID): The UUID of the game associated with the invitations.
        This function creates two invitations: one from player to friend and another from friend to player.
    """
    try :
        GameInvitation.objects.create(player1_id=playerId, player2_id=friendId, status=0, gameUUID=newGameUUID)
        GameInvitation.objects.create(player1_id=friendId, player2_id=playerId, status=1, gameUUID=newGameUUID)
    except Exception as e:
        logger.error(f"Error _create_game_invitations: {e}")

def _create_game_invite_notification(senderId, recipientId, content):
    """
        Create a notification for a game invitation.
        Args:
            senderId (int): ID of the player sending the notification.
            recipientId (int): ID of the player receiving the notification.
            content (str): The content of the notification.
        Returns:
            Notification: The newly created Notification instance.
    """
    return Notification.objects.create(sender_id=senderId, type=2, recipient_id=recipientId, content=content)


@csrf_exempt
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
        playerId = request.data.get('userId')
        friendId = request.data.get('contactId')
        status = request.data.get('status')
        if not _validate_friendship(playerId, friendId):
            return JsonResponse({"message": "You are not friends with this user."}, status=205)
        _update_game_invitation_status(playerId, friendId, status)
        return Response({"message": "Status updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _update_game_invitation_status(playerId, friendId, status):
    """
        Update the game invitation status between the player and their friend.
        Args:
            playerId (int): ID of the player initiating the update.
            friendId (int): ID of the friend whose invitation status is being updated.
            status (int): The new status for the game invitation (2 for accepted, -1 for declined).
    """
    if status == 2:
        _update_status_for_both_invites(playerId, friendId, 2)
    elif status == -1:
        _update_status_for_both_invites(playerId, friendId, -2)

def _update_status_for_both_invites(playerId, friendId, new_status):
    """
        Update the invitation status for both players.
        Args:
            playerId (int): ID of the player whose invitation is being updated.
            friendId (int): ID of the friend whose invitation is being updated.
            new_status (int): The new status to set for the invitations.
        This function updates the status of game invitations in both directions (player to friend and friend to player).
    """
    GameInvitation.objects.filter(player1_id=friendId, player2_id=playerId).update(status=new_status)
    GameInvitation.objects.filter(player1_id=playerId, player2_id=friendId).update(status=new_status)


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
        playerId = request.GET.get('userId')
        blocked_users = _get_blocked_users(playerId)
        social_users = _get_social_users(playerId, blocked_users)
        all_social_notifications = _get_all_social_notifications(playerId)
        social_users_list = [
            _build_social_user_data(user_data, playerId, all_social_notifications)
            for user_id, user_data in social_users.items()
        ]
        sorted_social_users = _sort_social_users(social_users_list)
        return Response(sorted_social_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _get_blocked_users(player_id):
    """
        Get a list of blocked users for the given player.
        Args:
            player_id (int): The ID of the player.
        Returns:
            list: A list of user IDs that the player has blocked.
    """
    return list(Friends.objects.filter(player_id=player_id, status=-3).values_list('friend_id', flat=True))

def _get_social_users(player_id, blocked_users):
    """
        Get social users for the given player, excluding blocked users.
        Args:
            player_id (int): The ID of the player.
            blocked_users (list): A list of user IDs that are blocked.
        Returns:
            QuerySet: A QuerySet of social users' data.
    """
    blocked_users.append(player_id)
    return _fetch_all_player_data_exclude(blocked_users)

def _get_all_social_notifications(player_id):
    """
        Retrieve all social notifications for the given player ID.
        Args:
            player_id (int): The ID of the player.
        Returns:
            QuerySet: A QuerySet of notification data.
    """
    try:
        return Notification.objects.filter(
            Q(type=3) | Q(type=4),
            recipient_id=player_id
        ).values('sender_id', 'type', 'content', 'created_at')
    except Exception as e:
        logger.error(f"Error _get_all_social_notifications: {e}")
        return []

def _build_social_user_data(social_user, player_id, notifications):
    """
        Build a dictionary of social user data, including online status, friend status, and notification flag.
        Args:
            social_user (dict): A dictionary containing social user information.
            player_id (int): The ID of the logged-in player.
            notifications (QuerySet): A QuerySet of notifications to check against.
        Returns:
            dict: A dictionary containing enriched social user data.
    """
    try :
        social_user_data = social_user
        social_user_data['is_online'] = social_user['is_online']
        social_user_data['friend_status'] = _getFriendStatus(player_id, social_user['id'])
        social_user_data['notif'] = 1 if any(notif['sender_id'] == social_user['id'] for notif in notifications) else 0
        return social_user_data
    except Exception as e:
        logger.error(f"Error _build_social_user_data: {e}")
        return {}

def _sort_social_users(social_users_list):
    """
        Sort social users based on their friendship status.
        Args:
            social_users_list (list): A list of social user data.
        Returns:
            list: A sorted list of social users.
    """
    priority = {2: 0, 1: 1, 0: 2, 3: 3, -2: 4, -1: 5}
    return sorted(social_users_list, key=lambda x: priority[x['friend_status']])

def _getFriendStatus(player_id, friend_id):
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
    """
        Update the friendship status between two users.
        Args:
            request (HttpRequest): Contains social user ID and friendship status.
        Returns:
            Response: Success or error message with status code.
        Raises:
            ValueError: If input data is invalid.
            Player.DoesNotExist: If player does not exist.
            Exception: For any other errors.
    """
    try:
        playerId, socialUserId, friend_status = _extract_social_data(request)
        actions = {
            0: _send_friend_request,
            2: _accept_friend_request,
            -1: _remove_friendship,
            -2: _decline_friend_request,
        }
        if friend_status not in actions:
            return Response({"error": "Invalid friendship action."}, status=400)
        with transaction.atomic():
            actions[friend_status](playerId, socialUserId)
        return Response({"message": "Status updated successfully"}, status=200)
    except ValueError:
        return Response({"error": "Invalid input data."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _extract_social_data(request):
    """
        Extract social user ID and friendship status from the request.
        Args:
            request (HttpRequest): The request object.
        Returns:
            tuple: Social user ID and friend status as integers.
        Raises:
            ValueError: If conversion to int fails.
    """
    userId = request.data.get('userId')
    social_user_id = request.data.get('socialUserId')
    friend_status = request.data.get('friendStatus')
    try:
        userId = int(userId)
        social_user_id = int(social_user_id)
        friend_status = int(friend_status)
    except ValueError:
        logger.error(f"Invalid input data: {userId}, {social_user_id}, {friend_status}")
        raise ValueError("Invalid input")
    return userId, social_user_id, friend_status

def _send_friend_request(playerId, social_user_id):
    """
        Send a friend request to another player.
        Args:
            playerId (int): The sender's ID.
            social_user_id (int): The recipient's ID.
        Returns:
            None: Updates the database with the request and status.
        Raises:
            Player.DoesNotExist: If the recipient does not exist.
    """
    Notification.objects.create(sender_id=playerId, type=3, recipient_id=social_user_id, content=f"Friend request from {playerId}")
    Friends.objects.update_or_create(player_id=playerId, friend_id=social_user_id, defaults={'status': 1})
    Friends.objects.update_or_create(player_id=social_user_id, friend_id=playerId, defaults={'status': 2})

def _accept_friend_request(playerId, social_user_id):
    """
        Accept a friend request from another player.
        Args:
            playerId (int): The ID of the accepter.
            social_user_id (int): The ID of the sender.
        Returns:
            None: Updates the database with the status change.
        Raises:
            Player.DoesNotExist: If the sender does not exist.
    """
    Notification.objects.create(sender_id=playerId, type=4, recipient_id=social_user_id, content=f"{playerId} accepted your friend request")
    Friends.objects.update_or_create(player_id=playerId, friend_id=social_user_id, defaults={'status': 3})
    Friends.objects.update_or_create(player_id=social_user_id, friend_id=playerId, defaults={'status': 3})

def _remove_friendship(playerId, social_user_id):
    """
        Remove a friendship with another player.
        Args:
            playerId (int): The ID of the remover.
            social_user_id (int): The ID of the player to remove.
        Returns:
            None: Updates the database and deletes notifications.
        Raises:
            Player.DoesNotExist: If the target does not exist.
    """
    try:
        Notification.objects.filter(sender_id=playerId, recipient_id=social_user_id, type=1).delete()
        Notification.objects.filter(sender_id=social_user_id, recipient_id=playerId, type=1).delete()
        Friends.objects.filter(player_id=playerId, friend_id=social_user_id).delete()
        Friends.objects.filter(player_id=social_user_id, friend_id=playerId).delete()
    except Exception as e:
        logger.error(f"Error _remove_friendship: {e}")

def _decline_friend_request(playerId, social_user_id):
    """
        Decline a friend request from another player.
        Args:
            playerId (int): The ID of the decliner.
            social_user_id (int): The ID of the sender.
        Returns:
            None: Updates the database and deletes notifications.
        Raises:
            Player.DoesNotExist: If the sender does not exist.
    """
    try:
        Notification.objects.filter(sender_id=playerId, recipient_id=social_user_id, type=1).delete()
        Notification.objects.filter(sender_id=social_user_id, recipient_id=playerId, type=1).delete()
        Friends.objects.filter(player_id=playerId, friend_id=social_user_id).update(status=-1)
        Friends.objects.filter(player_id=social_user_id, friend_id=playerId).update(status=-3)
    except Exception as e:
        logger.error(f"Error _decline_friend_request: {e}")


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
        recipient_id = request.GET.get('userId')
        if not recipient_id:
            return Response({"error": "Recipient ID is required"}, status=400)
        notifications = Notification.objects.filter(recipient_id=recipient_id).values(
            'sender_id', 'type', 'content', 'created_at'
        ).order_by('-created_at')
        return Response(notifications, status=200)
    except Exception as e:
        return _handle_exception(e)


@csrf_exempt
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
        notifications_count = _count_notifications(request.GET.get('userId'), [1, 2])
        return Response({"nbrNotif": notifications_count}, status=200)
    except Exception as e:
        return _handle_exception(e)


@csrf_exempt
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
        notifications_count = _count_notifications(request.GET.get('userId'), [3, 4])
        return Response({"nbrNotif": notifications_count}, status=200)
    except Exception as e:
        return _handle_exception(e)


@csrf_exempt
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
        _delete_notifications_type(request.GET.get('userId'), [3, 4])
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Exception as e:
        return _handle_exception(e)


@csrf_exempt
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
        _delete_notifications_between(request.GET.get('userId'), request.GET.get('friendsId'), [1, 2])
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Exception as e:
        return _handle_exception(e)


# _____________________________________ Notif Utils  _____________________________________


def _count_notifications(player_id, types):
    """
        Counts the number of notifications for a player by type.
        Args:
            player_id (int): The ID of the player.
            types (list): A list of notification types to count.
        Returns:
            int: The total count of notifications for the specified types.
    """
    return sum(Notification.objects.filter(recipient_id=player_id, type=type).count() for type in types)

def _delete_notifications_type(playerId, types):
    """
        Deletes notifications for a player by type.
        Args:
            playerId (int): The ID of the player.
            types (list): A list of notification types to delete.
        Returns:
            None: Deletes notifications matching the specified types.
    """
    for type in types:
        Notification.objects.filter(recipient_id=playerId, type=type).delete()

def _delete_notifications_between(sender, recipient, types):
    """
        Deletes notifications between two players by type.
        Args:
            sender (int): The ID of the sender.
            recipient (int): The ID of the recipient.
            types (list): A list of notification types to delete.
        Returns:
            None: Deletes notifications matching the specified types between the sender and recipient.
    """
    for type in types:
        Notification.objects.filter(sender_id=sender, recipient_id=recipient, type=type).delete()

def _handle_exception(e):
    """
        Handles exceptions and returns an appropriate error message.
        Args:
            e (Exception): The exception to handle.
        Returns:
            Response: A response containing the error message and a 500 status code.
    """
    return Response({"error": str(e)}, status=500)


# _____________________________________ fetch USER  _____________________________________


def _fetch_user_data(player_id: int) -> dict:
    """
    Fetch player data from the API.
    
    Args:
        player_id (int): The ID of the player.
    
    Returns:
        dict: The player data or None if an error occurs.
    """
    url = f"{BASE_URL}/api/getPlayerById?userId={player_id}"
    return _make_request(url)

def _fetch_users_data(player_ids: list[int]) -> dict:
    """
    Fetch data for multiple players from the API.
    
    Args:
        player_ids (list[int]): A list of player IDs.
    
    Returns:
        dict: The players' data or None if an error occurs.
    """
    player_ids_str = ','.join(map(str, player_ids))
    url = f"{BASE_URL}/api/getPlayersByIds?playersIds={player_ids_str}"
    return _make_request(url)

def _fetch_all_player_data_exclude(blocked_users: list[int]) -> dict:
    """
    Fetch all player data excluding blocked users.
    
    Args:
        blocked_users (list[int]): A list of blocked user IDs.
    
    Returns:
        dict: The player data excluding blocked users or None if an error occurs.
    """
    blocked_users_str = ','.join(map(str, blocked_users))
    url = f"{BASE_URL}/api/getAllPlayerDataExcludeIds?excludeIds={blocked_users_str}"
    return _make_request(url)

def _remove_game_by_id(gameUUID: str) -> dict:
    """
    Remove a game by its UUID.
    
    Args:
        gameUUID (str): The UUID of the game.
    
    Returns:
        dict: The response data or None if an error occurs.
    """
    url = f"{BASE_URL}/api/removeGameByUUID?gameUUID={gameUUID}"
    return _make_request(url)

def _create_game_api(playerId: int, contactId: int, gameType: str) -> dict:
    """
    Create a game via the API.
    
    Args:
        playerId (int): The ID of the first player.
        contactId (int): The ID of the second player.
        gameType (str): The type of the game.
    
    Returns:
        dict: The response data or None if an error occurs.
    """
    url = f"{BASE_URL}/api/createGame?player1={playerId}&player2={contactId}&gameType={gameType}"
    return _make_request(url)

def _make_request(url: str) -> dict:
    """ 
        Make a GET request and return JSON data or None.
        Args:
            url (str): The URL for the request.
        Returns:
            dict: The JSON response data or None if an error occurs.
    """
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Request error: {e}")
        return None
    except ValueError:
        logger.error("Failed to parse JSON response.")
        return None
    except Exception as e:
        logger.error(f"Error: {e}")
        return None