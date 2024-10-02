from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Player, Friends, Messages, User, GameInvitation, Notification, Game
from rest_framework.decorators import parser_classes
from rest_framework.parsers import FormParser
from .serializer import LoginEncoder
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout as auth_logout
import requests
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db.models import Case, IntegerField, Sum, When
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from itertools import chain
from channels.layers import get_channel_layer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import async_to_sync
from django.db.models import Q
from api.login_required import login_required


@api_view(['GET'])
@login_required
def getChatUser(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        friends = Friends.objects.filter(player_id=player.id, status=3).values_list('friend_id', flat=True)
        chat_users = Player.objects.filter(id__in=friends).values('id', 'username', 'img')
        all_social_notif_for_user = Notification.objects.filter(
            Q(type=1) | Q(type=2),
            recipient=player
        ).values('sender__id', 'type', 'content', 'created_at')
        for chat_user in chat_users:
            chat_user['is_online'] = Player.objects.get(id=chat_user['id']).is_online
            nbrNotifForUser = 0
            for notif in all_social_notif_for_user:
                if notif['sender__id'] == chat_user['id']:
                    nbrNotifForUser += 1
            chat_user['notif'] = nbrNotifForUser
        return Response(chat_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getMessages(request):
    try:
        id = request.GET.get('contactId')
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)

        messages_sent_by_user = Messages.objects.filter(sender=player, receiver=friend).values('sender', 'content', 'created_at')
        messages_received_by_user = Messages.objects.filter(sender=friend, receiver=player).values('sender', 'content', 'created_at')

        for message in chain(messages_sent_by_user, messages_received_by_user):
            message['type'] = 0

        game_invitations_sent = GameInvitation.objects.filter(player1=player, player2=friend).values('player1', 'player2', 'status', 'created_at')

        for invitation in game_invitations_sent:
            invitation['type'] = 1
            invitation['content'] = f"Game invitation from {invitation['player1']} to {invitation['player2']}"

        combined_list = list(messages_sent_by_user) + list(messages_received_by_user) + list(game_invitations_sent)

        combined_list.sort(key=lambda x: x['created_at'])
        return Response(combined_list, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

import logging

logger = logging.getLogger('print')

@csrf_exempt
@api_view(['POST'])
@login_required
def sendInvite(request):
    try:        
        id = request.data.get('contactId')
        user = request.user

        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)
        relationship = Friends.objects.filter(player_id=player.id, friend_id=friend.id)
        if not relationship.exists() or relationship[0].status != 3:
            return JsonResponse({"message": "You are not friends with this user."}, status=201)
        if GameInvitation.objects.filter(player1=player, player2=friend).exists():
            gameid = GameInvitation.objects.get(player1=player, player2=friend).game_id.UUID
            if Game.objects.filter(UUID=gameid).exists():
                Game.objects.filter(UUID=gameid).delete()
            GameInvitation.objects.filter(player1=player, player2=friend).delete()
        if GameInvitation.objects.filter(player1=friend, player2=player).exists():
            gameid = GameInvitation.objects.get(player1=friend, player2=player).game_id.UUID
            if Game.objects.filter(UUID=gameid).exists():
                Game.objects.filter(UUID=gameid).delete()
            GameInvitation.objects.filter(player1=friend, player2=player).delete()
        newGamePriv = Game.objects.create(
            player1=player,
            player2=friend,
            elo_before_player1=player.eloPong,
            elo_before_player2=friend.eloPong,
            elo_after_player1=None,
            elo_after_player2=None,
            finish=False,
            type='pongPv',
        )
        newGamePriv.save()
        GameInvitation.objects.create(player1=player, player2=friend, status=0, game_id=newGamePriv)
        GameInvitation.objects.create(player1=friend, player2=player, status=1, game_id=newGamePriv)
        if Notification.objects.filter(sender=player, recipient=friend, type=2).exists():
            Notification.objects.filter(sender=player, recipient=friend, type=2).delete()
        Notification.objects.create(sender=player, type=2, recipient=friend, content=f"tournament invitation from {player.username}")
        return Response({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@login_required
def sendMessage(request):
    try:        
        contactId = request.data.get('contactId')
        content = request.data.get('message')
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=contactId)
        relationship = Friends.objects.filter(player_id=player.id, friend_id=friend.id)
        if not relationship.exists() :
            return JsonResponse({"message": "You are not friends with this user."}, status=201)
        Messages.objects.create(sender=player, receiver=friend, content=content)
        Notification.objects.create(sender=player, type=1, recipient=friend, content=f"New message from {player.username}")
        return JsonResponse({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return JsonResponse({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

def getFriendStatus(player_id, friend_id):
    try:
        f = Friends.objects.get(player_id=player_id, friend_id=friend_id)
    except Friends.DoesNotExist:
        f = None
    if f is None:
        return 0
    return f.status

@api_view(['GET'])
@login_required
def getSocialUser(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        blocked_users = Friends.objects.filter(player_id=player.id, status=-3).values_list('friend_id', flat=True)
        social_users = Player.objects.exclude(id__in=blocked_users).exclude(id=player.id).values('id', 'username', 'img')
        all_social_notif_for_user = Notification.objects.filter(
            Q(type=3) | Q(type=4),
            recipient=player
        ).values('sender__id', 'type', 'content', 'created_at')
        social_users_list = []
        for social_user in social_users:
            social_user_data = social_user
            social_user_data['is_online'] = Player.objects.get(id=social_user['id']).is_online
            social_user_data['friend_status'] = getFriendStatus(player.id, social_user['id'])
            social_user_data['notif'] = 1 if any(notif['sender__id'] == social_user['id'] for notif in all_social_notif_for_user) else 0
            social_users_list.append(social_user_data)
        priority = {2: 0, 1: 1, 0: 2, 3: 3, -2: 4, -1: 5}
        sorted_social_users = sorted(social_users_list, key=lambda x: priority[x['friend_status']])
        return Response(sorted_social_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@login_required
def isOnline(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        return Response({"is_online": player.profile.is_online}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

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

def hashRoomName(input_string):
    hash_value = 0
    for char in input_string:
        hash_value = (hash_value * 31 + ord(char)) % (2**32)
    return hash_value

@api_view(['GET'])
@login_required
def getHashRoom(request):
    try:
        roomName = request.GET.get('roomName')
        roomName = hashRoomName(roomName)
        return Response({"roomName": roomName}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getGlobalNotif(request):
    try:
        user = request.user
        player = Player.objects.get(username=user.username)
        notifications = Notification.objects.filter(recipient=player).values('sender__id', 'type', 'content', 'created_at')  # Utilisez sender__id pour récupérer l'ID du sender
        notifications = notifications.order_by('-created_at')
        return Response(notifications, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def removeChatNotif(request):
    try:
        user = request.user
        player = Player.objects.get(username=user.username)
        userId = request.GET.get('userId')
        sender = Player.objects.get(id=userId)
        notif = Notification.objects.filter(sender=sender, recipient=player, type=1)
        notif.delete()
        notif = Notification.objects.filter(sender=sender, recipient=player, type=2)
        notif.delete()
        return Response({"message": "Chat notifications removed successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getNbrChatNotif(request):
    try:
        userId = request.GET.get('userId')
        user = User.objects.get(id=userId)
        player = Player.objects.get(username=user.username)
        notifications = 0
        msgNotif = Notification.objects.filter(recipient=player, type=1)
        msgNotif = msgNotif.count()
        invitNotif = Notification.objects.filter(recipient=player, type=2)
        invitNotif = invitNotif.count()
        notifications = msgNotif + invitNotif
        return Response({"nbrNotif": notifications}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getNbrSocialNotif(request):
    try:
        userId = request.GET.get('userId')
        user = User.objects.get(id=userId)
        player = Player.objects.get(username=user.username)
        notifications = 0
        friendsRequestNotif = Notification.objects.filter(recipient=player, type=3)
        friendsRequestNotif = friendsRequestNotif.count()
        newFriendsNotif = Notification.objects.filter(recipient=player, type=4)
        newFriendsNotif = newFriendsNotif.count()
        notifications = friendsRequestNotif + newFriendsNotif
        return Response({"nbrNotif": notifications}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@login_required
def updateInviteStatus(request):
    try:
        user = request.user
        contactId = request.data.get('contactId')
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=contactId)
        status = request.data.get('status')
        if status == 2:
            GameInvitation.objects.filter(player1=friend, player2=player).update(status=2)
            GameInvitation.objects.filter(player1=player, player2=friend).update(status=2)
        elif status == -1:
            GameInvitation.objects.filter(player1=friend, player2=player).update(status=-2)
            GameInvitation.objects.filter(player1=player, player2=friend).update(status=-2)
        return Response({"message": "Status updated successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str})

@api_view(['GET'])
@login_required
def clearNotifSocial(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        Notification.objects.filter(recipient=player, type=3).delete()
        Notification.objects.filter(recipient=player, type=4).delete()
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def clearNotifChatForUser(request):
    try:
        user = request.user
        chatuser = request.GET.get('userId')
        chatPlayer = Player.objects.get(id=chatuser)
        player = Player.objects.get(username=user)
        allnotif = Notification.objects.filter(sender=chatPlayer, recipient=player, type=1)
        allnotif.delete()
        allnotif = Notification.objects.filter(sender=chatPlayer, recipient=player, type=2)
        allnotif.delete()
        return Response({"message": "Notifications cleared successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)