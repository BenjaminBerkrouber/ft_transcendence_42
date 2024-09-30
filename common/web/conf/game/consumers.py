from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json
import random
from game.Class.engine import Engine
from asgiref.sync import sync_to_async

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

from users.serializer import PlayerSerializer
import asyncio
import logging
import hashlib
from django.utils import timezone

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

logger = logging.getLogger('print')
class Connect4GameConsumer(AsyncWebsocketConsumer):
    games = {}
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'connect4_%s' % self.room_name
        logger.info(f"CONNECT called for room {self.room_name}")

        if self.room_name not in Connect4GameConsumer.games:
            Connect4GameConsumer.games[self.room_name] = {
                'board': [['' for i in range(7)] for j in range(6)],
                'playerTurn': 'red',
                'gameFinished': False,
                'winner': None,
                'timer': 30,
                'timer_started': False,
                'game_id': self.room_name,
                'player1': None,
                'player2': None
            }

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        logger.info("CONNECT called")
        logger.info(self.room_group_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        player_id = text_data_json.get('player_id')
        player = await sync_to_async(models.Player.objects.get)(id=player_id)
        logger.info("player : ")
        logger.info(str(player))
        try:
            game = await sync_to_async(models.Game.objects.get)(UUID=self.room_name)
            if game is None:
                logger.info("Game does not exist")
                await self.send(text_data=json.dumps({
                    'type': 'Game does not exist'
                }))
                self.disconnect(1)
            if game.finish:
                logger.info("Game has already finished")
                await self.send(text_data=json.dumps({
                    'type': 'Game has already finished'
                }))
                return
        except Exception as e:
            logger.info(e)
            await self.send(text_data=json.dumps({
                'type': 'Game does not exist'
            }))
            self.disconnect(1)
            return

        if text_data_json['type'] == "join":
            roles = ['yellow', 'red']

            if Connect4GameConsumer.games[self.room_name]['player1'] is None or Connect4GameConsumer.games[self.room_name]['player1']['player'].id == player.id:
                role = random.choice(roles)
                Connect4GameConsumer.games[self.room_name]['player1'] = {'player': player,'color': role}
                await self.send(text_data=json.dumps({
                    'type': 'roleGiving',
                    'role': role,
                    'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                    'board': Connect4GameConsumer.games[self.room_name]['board'],
                    'playerInfo': PlayerSerializer(player).data,
                    'opponentInfo': None
                }))
            elif Connect4GameConsumer.games[self.room_name]['player2'] is None or Connect4GameConsumer.games[self.room_name]['player2']['player'].id == player.id:
                color = Connect4GameConsumer.games[self.room_name]['player1']['color']
                role = 'yellow' if color == 'red' else 'red'
                opponent = await sync_to_async(models.Player.objects.get)(id=Connect4GameConsumer.games[self.room_name]['player1']['player'].id)
                Connect4GameConsumer.games[self.room_name]['player2'] = {'player': player, 'color': role}
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'role.giver',
                    'role': role,
                    'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                    'sender': self.channel_name,
                    'board': Connect4GameConsumer.games[self.room_name]['board'],
                    'playerInfo': player,
                    'opponentInfo': opponent
                }
            )
            else:
                await self.send(text_data=json.dumps({
                    'type': 'Game is full'
                }))
                return
            
            if not Connect4GameConsumer.games[self.room_name]['timer_started']:
                asyncio.create_task(self.start_timer()) # Start timer for the game
                Connect4GameConsumer.games[self.room_name]['timer_started'] = True
            return
        
        if text_data_json['type'] == "reset":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reset',
                    'winner': text_data_json['winner']
                }
            )
            return
        columnSelected = text_data_json['col']
        rowSelected = text_data_json['row']
        currentPlayer = text_data_json['player']
        nextPlayer = 'yellow' if currentPlayer == 'red' else 'red'
        Connect4GameConsumer.games[self.room_name]['playerTurn'] = nextPlayer
        Connect4GameConsumer.games[self.room_name]['timer'] = 30
        opponent = Connect4GameConsumer.games[self.room_name]['player1'] \
            if player.id != Connect4GameConsumer.games[self.room_name]['player1']['player'].id \
            else Connect4GameConsumer.games[self.room_name]['player2']
        if opponent is not None:
            opponent = opponent['player']
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game.move',
                'column': columnSelected,
                'row': rowSelected,
                'player': text_data_json['player'],
                'playerInfo': player,
                'opponentInfo': opponent,
                'nextTurn': nextPlayer
            }
        )

    async def game_move(self, event):
        column = event['column']
        row = event['row']
        serializePlayer = PlayerSerializer(event['playerInfo']).data
        serializePlayer['img'] = event['playerInfo'].img.name
        serializeOpps = None
        if event['opponentInfo'] is not None:
            serializeOpps = PlayerSerializer(event['opponentInfo']).data
            serializeOpps['img'] = event['opponentInfo'].img.name
        # modify the board 
        Connect4GameConsumer.games[self.room_name]['board'][row][column] = event['player']
        for i in range(6):
            for j in range(7):
                if Connect4GameConsumer.games[self.room_name]['board'][i][j] == '':
                    break
            if Connect4GameConsumer.games[self.room_name]['board'][i][j] == '':
                break
        if i == 5 and j == 6:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reset',
                    'winner': 'draw'
                }
            )
            return
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'column': column,
            'row': row,
            'player': event['player'],
            'playerInfo': serializePlayer,
            'opponentInfo': serializeOpps,
            'next_player': event['nextTurn'],
            'board': Connect4GameConsumer.games[self.room_name]['board']
        }))
        

    async def role_giver(self, event):
        serializeOpps = PlayerSerializer(event['opponentInfo']).data
        serializePlayer = PlayerSerializer(event['playerInfo']).data
        serializePlayer['img'] = event['playerInfo'].img.name
        serializeOpps['img'] = event['opponentInfo'].img.name
        if self.channel_name == event['sender']:
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': event['role'],
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'playerInfo': serializePlayer,
                'opponentInfo': serializeOpps
            }))
        else:
            opposite_role = 'red' if event['role'] == 'yellow' else 'yellow'
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': opposite_role,
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'playerInfo': serializeOpps,
                'opponentInfo': serializePlayer
            }))

    async def reset(self, event):
        Connect4GameConsumer.games[self.room_name]['gameFinished'] = True
        Connect4GameConsumer.games[self.room_name]['winner'] = event['winner']
        gameid = Connect4GameConsumer.games[self.room_name]['game_id'] # self.room_name
        player1 = Connect4GameConsumer.games[self.room_name]['player1']
        player2 = Connect4GameConsumer.games[self.room_name]['player2']
        game = await sync_to_async(models.Game.objects.get)(UUID=gameid)
        if event['winner'] == 'draw':
            game.finish = True
            game.time = (int)((timezone.now() - game.created_at).total_seconds())
            await sync_to_async(game.save)()
            await self.send(text_data=json.dumps({
                'type': "reset",
                'winner': event['winner']
            }))
            return
        player1DB = await sync_to_async(models.Player.objects.get)(id=player1['player'].id)
        if player2 is not None:
            player2DB = await sync_to_async(models.Player.objects.get)(id=player2['player'].id)
        else:
            player2DB = await sync_to_async(lambda: game.player2)()
        if event['winner'] == player1['color']:
            player1DB.eloConnect4 += 10 * (1 - ((2 ** (player1DB.eloConnect4/ 100)) / ((2 ** (player1DB.eloConnect4/ 100)) + (2 ** (player2DB.eloConnect4/ 100)))))
            player2DB.eloConnect4 += 10 * (0 - ((2 ** (player2DB.eloConnect4/ 100)) / ((2 ** (player2DB.eloConnect4/ 100)) + (2 ** (player1DB.eloConnect4/ 100)))))
            game.winner = player1DB
        else:
            player1DB.eloConnect4 += 10 * (0 - ((2 ** (player1DB.eloConnect4/ 100)) / ((2 ** (player1DB.eloConnect4/ 100)) + (2 ** (player2DB.eloConnect4/ 100)))))
            player2DB.eloConnect4 += 10 * (1 - ((2 ** (player2DB.eloConnect4/ 100)) / ((2 ** (player2DB.eloConnect4/ 100)) + (2 ** (player1DB.eloConnect4/ 100)))))
            game.winner = player2DB
        game.elo_after_player1 = player1DB.eloConnect4
        game.elo_after_player2 = player2DB.eloConnect4
        game.finish = True
        game.time = (int)((timezone.now() - game.created_at).total_seconds())
        await sync_to_async(game.save)()
        await sync_to_async(player1DB.save)()
        await sync_to_async(player2DB.save)()
        await self.send(text_data=json.dumps({
            'type': "reset",
            'winner': event['winner']
        }))

    async def start_timer(self):
        while True:
            if Connect4GameConsumer.games[self.room_name]['gameFinished']:
                break
            await asyncio.sleep(1)
            if Connect4GameConsumer.games[self.room_name]['timer'] > 0:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'timer_update',
                        'timer': Connect4GameConsumer.games[self.room_name]['timer'],
                        'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                        'board': Connect4GameConsumer.games[self.room_name]['board'],
                        'player1': Connect4GameConsumer.games[self.room_name]['player1'],
                        'player2': Connect4GameConsumer.games[self.room_name]['player2'],
                        'sender': self.channel_name
                    }
                )
                Connect4GameConsumer.games[self.room_name]['timer'] -= 1
            else:
                # Handle timeout (e.g., end the game, declare a winner, etc.)
                if Connect4GameConsumer.games[self.room_name]['playerTurn'] == 'red':
                    winner = 'yellow'
                else:
                    winner = 'red'
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'timeout',
                        'winner': winner
                    }
                )
                break

    async def timer_update(self, event):
        logger.info("TIMER UPDATE called")
        logger.info(str(event['player1']))
        player1 = PlayerSerializer(event['player1']['player']).data
        player1['img'] = event['player1']['player'].img.name
        player1['color'] = event['player1']['color']
        player2 = None
        if event['player2'] is not None:
            player2 = PlayerSerializer(event['player2']['player']).data
            player2['img'] = event['player2']['player'].img.name
            player2['color'] = event['player2']['color']
        if self.channel_name == event['sender']:
            await self.send(text_data=json.dumps({
                'type': 'timer_update',
                'timer': event['timer'],
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'player1': player1,
                'player2': player2
            }))
        else:
            await self.send(text_data=json.dumps({
                'type': 'timer_update',
                'timer': event['timer'],
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'player1': player2,
                'player2': player1
            }))

    async def timeout(self, event):
        await self.send(text_data=json.dumps({
            'type': 'timeout',
            'winner': event['winner']
        }))

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

class RankedGameConsumer(AsyncWebsocketConsumer):
    waiting_list = []
    playing_list = []
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        for i in range(len(RankedGameConsumer.waiting_list)):
            if RankedGameConsumer.waiting_list[i]['socket'] == self:
                RankedGameConsumer.waiting_list.pop(i)
                break
        pass
        for i in range(len(RankedGameConsumer.playing_list)):
            if RankedGameConsumer.playing_list[i]['socket'] == self:
                await RankedGameConsumer.playing_list[i]['socket_opps'].send(text_data=json.dumps({
                    'type': 'opponentDisconnected',
                    'game_id': str(RankedGameConsumer.playing_list[i]['game'].UUID),
                    'game_type': RankedGameConsumer.playing_list[i]['game'].type
                }))
                RankedGameConsumer.playing_list.pop(i)
                break

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['action']
        if text_data_json['action'] == 'heartbeat':
            return
        player = await sync_to_async(models.Player.objects.get)(id = text_data_json.get('player_id'))
        if (len(RankedGameConsumer.waiting_list) > 0 and 
            any(entry["player"] == player for entry in RankedGameConsumer.waiting_list)):
            await self.send(text_data=json.dumps({
                'type': 'alreadyInQueue',
                'message': 'You are already in queue'
            }))
            return
        if (len(RankedGameConsumer.waiting_list) == 0):
            self.waiting_list.append({"socket": self, "player":player})
            return
        if (len(RankedGameConsumer.waiting_list) > 0):
            opps = RankedGameConsumer.waiting_list[0]['player']
            if (text_data_json.get('game_type') == 'pong'):
                game = await sync_to_async(models.Game.objects.create)(
                    player1 = player, 
                    player2 = opps, 
                    elo_before_player1 = player.eloPong,
                    elo_before_player2 = opps.eloPong,
                    elo_after_player1 = player.eloPong,
                    elo_after_player2 = opps.eloPong,
                    winner = opps,
                    type = text_data_json.get('game_type'))
            else:
                game = await sync_to_async(models.Game.objects.create)(
                    player1 = player, 
                    player2 = opps, 
                    elo_before_player1 = player.eloConnect4,
                    elo_before_player2 = opps.eloConnect4,
                    elo_after_player1 = player.eloConnect4,
                    elo_after_player2 = opps.eloConnect4,
                    winner = opps,
                    type = text_data_json.get('game_type'))
            serializePlayer = PlayerSerializer(player).data
            serializePlayer['img'] = player.img.name
            serializeOpps = PlayerSerializer(opps).data
            serializeOpps['img'] = opps.img.name
            await RankedGameConsumer.waiting_list[0]['socket'].send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializeOpps,
                'opponent': serializePlayer,
                'game_id': str(game.UUID),
                'game_type': game.type
            }))
            await self.send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializePlayer,
                'opponent': serializeOpps,
                'game_id': str(game.UUID),
                'game_type': game.type
            }))
            self.playing_list.append({"socket": self.waiting_list[0]['socket'], "player": opps, "opponent": player, "socket_opps": self, "game": game})
            self.playing_list.append({"socket": self, "player": player, "opponent": opps, "socket_opps": RankedGameConsumer.waiting_list[0]['socket'], "game": game})
            RankedGameConsumer.waiting_list.pop(0)
            return
        return