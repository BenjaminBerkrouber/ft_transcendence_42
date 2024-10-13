from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json
import random
from game.Class.engine import Engine
from asgiref.sync import sync_to_async

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer

import asyncio
import logging
import hashlib
from django.utils import timezone


from django.db import DatabaseError
from django.core.exceptions import ObjectDoesNotExist
import logging 

logger = logging.getLogger('print')

server = Engine()

class GameConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.server = server

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.room_name}'


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
        userId = text_data_json['userId']
        eventType = text_data_json['eventType']
        message = text_data_json['message']

        command = message.split(" | ")[1]
        if command == "start" and (self.server.players.__len__() == 2) and (self.server.state == "waiting"):
            logger.info(f"=======================================\nreceived start from game {self.server.players.__len__()}")
            self.server.ws = self
            self.server.state = "playing"
            self.server.thread.start()
            return 
        
        if command == "info":
            # logger.info(f"received info from game {self.server.players[0]} - {userId}")
            if userId == self.server.players[0]:
                self.server.ball.pos.x = float(message.split(' | ')[2])
                self.server.ball.pos.y = float(message.split(' | ')[3])
                self.server.ball.acc.x *= -1
                await self.server.sendtoPlayers(json.dumps({"x": self.server.ball.acc.x, "y": self.server.ball.acc.y, "start": False}), "moveBall")
            return
        
        if command == "reset":
            if userId == self.server.players[0]:
            # logger.info(f"received reset from game {self.server.players[0]} - {userId}")
                self.server.ball.pos.x = 0
                self.server.ball.pos.y = 0
                self.server.ball.acc.x = 0.1
                self.server.ball.acc.y = 0
                await self.server.sendtoPlayers(json.dumps({"x": self.server.ball.acc.x, "y": self.server.ball.acc.y, "start": False}), "resetBall")   
            return
		
        if command == "ready":
            self.server.players.append(userId)
            logger.info(f"received ready from game {self.server.players.__len__()}")
            for player in self.server.players:
                logger.info(f"player: {player}")
            # return 

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'userId' : userId,
                'eventType': eventType,
                'message': message
            }
        )
    
    async def game_update(self, event):
        userId = event['userId']
        eventType = event['eventType']
        message = event['message']


        await self.send(text_data=json.dumps({
            'userId' : userId,
            'eventType': eventType,
            'message': message,
        }))

def get_games(tournament_uuid):
    return list(Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament_uuid))

def get_player(game_id):
    game_tournament = Game_Tournament.objects.get(id=game_id)
    players_list = list(game_tournament.players.all())
    return players_list


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
