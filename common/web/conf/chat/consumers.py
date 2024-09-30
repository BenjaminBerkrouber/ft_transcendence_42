import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import sync_to_async

import logging

logger = logging.getLogger('print')

class NotifConsumer(AsyncWebsocketConsumer):
    
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.room_name = None
            self.room_group_name = None
        
        async def connect(self):
            self.room_name = self.scope[
                'url_route']['kwargs']['room_name']
            self.room_group_name = f'notif_{self.room_name}'    
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
    
            await self.accept()
    
        async def disconnect(self, close_code):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
        async def receive(self, text_data):
            text_data_json = json.loads(text_data)
            ID_Game = text_data_json['ID_Game']
            UUID_Tournament = text_data_json['UUID_Tournament']
            link = text_data_json['link']
            notifType = text_data_json['notifType']
            userDestination = text_data_json['userDestination']

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notif_message',
                    'notifType': notifType,
                    'ID_Game': ID_Game,
                    'UUID_Tournament' : UUID_Tournament,
                    'link' : link,
                    'userDestination' : userDestination
                }
            )

        async def notif_message(self, event):

            await self.send(text_data=json.dumps({
                'notifType': event['notifType'],
                'ID_Game': event['ID_Game'],
                'UUID_Tournament' : event['UUID_Tournament'],
                'link' : event['link'],
                'userDestination' : event['userDestination']
            }))


class SocialConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'social_{self.room_name}'


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        updateId = text_data_json['updateId']
        senderId = text_data_json['senderId']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'social_updateId',
                'updateId': updateId,
                'senderId' : senderId
            }
        )

    async def social_updateId(self, event):
        updateId = event['updateId']
        senderId = event['senderId']

        await self.send(text_data=json.dumps({
            'updateId': updateId,
            'senderId' : senderId
        }))

class ChatConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        senderId = text_data_json['senderId']
        contactId = text_data_json['contactId']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'senderId' : senderId,
                'contactId' : contactId
            }
        )

    async def chat_message(self, event):
        message = event['message']
        senderId = event['senderId']
        contactId = event['contactId']

        await self.send(text_data=json.dumps({
            'message': message,
            'senderId' : senderId,
            'contactId' : contactId
        }))

def get_games(tournament_uuid):
    return list(Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament_uuid))

def get_player(game_id):
    game_tournament = Game_Tournament.objects.get(id=game_id)
    players_list = list(game_tournament.players.all())
    return players_list


import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db import DatabaseError
import logging

logger = logging.getLogger(__name__)

class LobbyConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'lobby_{self.room_name}'


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            if 'eventType' in text_data_json:
                eventType = text_data_json['eventType']

                if eventType == 'lock_lobby':
                    await self.lock_lobby(text_data)
                    return

                message = text_data_json['message']
                userId = text_data_json['userId']

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'lobby_message',
                        'userId': userId,
                        'eventType': eventType,
                        'message': message,
                    }
                )
        except json.JSONDecodeError as e:
            logger.error(f"[WebSocket LOBBY] : JSON decode error: {e}")
        except Exception as e:
            logger.error(f"[WebSocket LOBBY] : Error in receive: {e}")

    async def lobby_message(self, event):
        try:
            userId = event['userId']
            eventType = event['eventType']
            message = event['message']


            await self.send(text_data=json.dumps({
                'userId': userId,
                'eventType': eventType,
                'message': message,
            }))
        except Exception as e:
            logger.error(f"[WebSocket LOBBY] : Error in lobby_message: {e}")

    async def lock_lobby(self, text_data):
        try:
            text_data_json = json.loads(text_data)

            # Lock the lobby in the database
            lobby = await sync_to_async(Lobby.objects.get)(UUID=self.room_name)
            await sync_to_async(lobby.lock)()

            # Assuming you have logic to create games and determine their URLs
            tournament = await sync_to_async(Tournament.objects.get)(UUID_LOBBY=lobby.UUID)
            games = await sync_to_async(get_games)(tournament.UUID)

            # Create a mapping of players to game URLs
            player_game_urls = {}
            for game in games:
                players = await sync_to_async(get_player)(game.id)
                for player in players:
                    player_game_urls[player.id] = f'/game/pong/tournament/game/?gameId={game.id}'

            # Send the redirection message to all players
            for player_id, game_url in player_game_urls.items():
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'lobby_message',
                        'userId': player_id,
                        'eventType': 'redirect',
                        'message': game_url,
                    }
                )
        except Lobby.DoesNotExist:
            logger.error(f"[WebSocket LOBBY] : Lobby with UUID {self.room_name} does not exist.")
        except Tournament.DoesNotExist:
            logger.error(f"[WebSocket LOBBY] : Tournament with UUID_LOBBY {self.room_name} does not exist.")
        except DatabaseError as e:
            logger.error(f"[WebSocket LOBBY] : Database error: {e}")
        except Exception as e:
            logger.error(f"[WebSocket LOBBY] : Error in lock_lobby: {e}")
