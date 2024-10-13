# # ========================================================================================================
# # ============================================= Include  =================================================
# # ========================================================================================================


# _____________________________________ Standard Library Imports _____________________________________


import requests
import random


# _____________________________________ Django Imports _____________________________________


from django.db.models import Q
from django.core import serializers
from django.db.models import IntegerField, Sum
from django.db.models import Max
from django.utils import timezone
from django.http import JsonResponse
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt


# _____________________________________ Third-Party Imports _____________________________________


from itertools import chain
from functools import reduce
from datetime import timedelta, datetime
from rest_framework.response import Response
from rest_framework.decorators import api_view
BASE_URL = "https://172.17.0.1"


# _____________________________________ Local Application Imports _____________________________________


from users.login_required import login_required
from game.models import Game, PlayerGame, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer


# ======================================================================================================================
# ============================================= Utils Games METHODE  ===================================================
# ======================================================================================================================

import logging

logger = logging.getLogger('print')

@csrf_exempt
@api_view(['GET'])
@login_required
def getDataGamesPlayers(request):
    try:
        # generate_random_games()
        player_id = request.GET.get('userId')
        if not player_id:
            return Response({"error": "Player ID is required"}, status=400)
        pong_games = Game.objects.filter(
            players__player_id=player_id, 
            finish=True, 
            type='Pong'
        ).order_by('-created_at')
        connect4_games = Game.objects.filter(
            players__player_id=player_id, 
            finish=True, 
            type='Connect4'
        ).order_by('-created_at')
        data = []
        data.append({
            'pongGames': _get_array_game_serializers(pong_games)
        })
        data.append({
            'connect4Games': _get_array_game_serializers(connect4_games)
        })
        return Response({"data": data}, status=200)
    except Exception as e:
        return Response({"error here ": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def removeGameByUUID(request):
    try:
        gameUUID = request.GET.get('gameUUID')
        if not gameUUID:
            return Response({"error": "Game UUID is required"}, status=400)
        try:
            game = Game.objects.get(UUID=gameUUID)
            game.delete()
            logger.info(f"Game with UUID {gameUUID} has been removed.")
            return Response({"message": "Game removed successfully"}, status=200)
        except Game.DoesNotExist:
            return Response({"message": "no need to remove the game"}, status=200)
    except Exception as e:
        logger.error(f"Error while removing game: {e}")
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def createGame(request):
    try:
        player1 = request.GET.get('player1')
        player2 = request.GET.get('player2')
        game_type = request.GET.get('gameType', 'pongPv')

        new_game = Game.objects.create(
            type=game_type,
            finish=False,
        )
        elo_player1 = 1000  # A FAIRE
        elo_player2 = 1000  # A FAIRE

        PlayerGame.objects.create(
            game=new_game,
            player_id=player1,
            elo_before=elo_player1,
            elo_after=None,
        )

        PlayerGame.objects.create(
            game=new_game,
            player_id=player2,
            elo_before=elo_player2,
            elo_after=None,
        )
        logger.info(f"  newGameUUID: {new_game.UUID}")
        return Response(str(new_game.UUID), status=200)
    except Exception as e:
        logger.error(f"Error while creating game: {e}")
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def getGameUUID(request):
    try:
        player_id = request.GET.get('userId')
        opponent_id = request.GET.get('opponentId')
        gameType = request.GET.get('gameType')
        if not player_id or not opponent_id or not gameType:
            return Response({"error": "Player ID and opponent ID are required"}, status=400)
        game = Game.objects.filter(
            players__player_id__in=[player_id, opponent_id], type=gameType
        ).annotate(player_count=Count('players')).filter(player_count=2).order_by('-created_at').first()
        if game:
            return Response({"gameUUID": game.UUID}, status=200)
        return Response({"gameUUID": None}, status=200)
    except Exception as e:
        logger.error(f"Error while getting game UUID: {e}")
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def getGameData(request):
    try:
        gameUUID = request.GET.get('gameUUID')
        if not gameUUID:
            return Response({"error": "Game UUID is required"}, status=400)
        game = Game.objects.get(UUID=gameUUID)
        data = _get_game_serializers(game)
        logger.info(f"  data: {data}")
        return Response({"data": data}, status=200)
    except Game.DoesNotExist:
        return Response({"error": f"Game with id {gameUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ===============================================================================================
# ============================================ LOBBY ============================================
# ===============================================================================================

@api_view(['GET'])
@login_required
def getAllLobby(request):
    try:
        playerId = int(request.GET.get('userId'))
        lobbys = Lobby.objects.prefetch_related('ai_players').all().order_by('created_at')
        tab = [
            _get_lobby_serializers(lobby)
            for lobby in lobbys if playerId in lobby.players_ids
        ]
        logger.info(f'lobbys {tab}')
        logger.info(f'nbrAllLobby {len(Lobby.objects.all(   ))}')
        return Response({"data": tab}, status=200)
    except Exception as e:
        return Response({"data": []}, status=500)


@api_view(['GET'])
@login_required
def createLobby(request):
    try:
        playerId = int(request.GET.get('userId'))
        owner = playerId
        lobbyName = request.GET.get('lobbyName')
        lobby = Lobby.objects.create(owner_id=playerId, name=lobbyName)
        lobby.players_ids.append(playerId)
        lobby.save()
        logger.info(f"Lobby with name {lobbyName} has been created.")
        logger.info(f"  lobby seria: {_get_lobby_serializers(lobby)}")
        return Response({"data": _get_lobby_serializers(lobby)}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def removeLobby(request):
    try :
        lobbyUUID = request.GET.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "Lobby UUID is required"}, status=400)
        if not Lobby.objects.filter(UUID=lobbyUUID).exists():
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        Lobby.objects.get(UUID=lobbyUUID).delete()
        return Response({"message": "Lobby has been deleted"}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def _get_lobby_serializers(lobby):
    ia_players_ids = list(lobby.ai_players.values_list('id', flat=True))
    return {
        'UUID': str(lobby.UUID),
        'name': lobby.name,
        'isLocked': lobby.locked,
        'owner_id': lobby.owner_id,
        'players_ids': lobby.players_ids,
        'ia_players_ids': ia_players_ids,
        'created_at': lobby.created_at,
    }

@csrf_exempt
@api_view(['GET'])
@login_required
def getLobbyData(request):
    try:
        lobbyUUID = request.GET.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "Lobby UUID is required"}, status=400)
        if not Lobby.objects.filter(UUID=lobbyUUID).exists():
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        data = _get_lobby_data_serializers(lobby)
        logger.info(f"  data: {data}")
        return Response({"data": data}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _get_lobby_data_serializers(lobby):
    try :
        human_player = _fetch_users_data(lobby.players_ids)
        ia_players = _get_ias_serializers(lobby.ai_players.all()) 
        return {
            'UUID': str(lobby.UUID),
            'name': lobby.name,
            'isLocked': lobby.locked,
            'owner_id': lobby.owner_id,
            'human_player': human_player,
            'ia_players': ia_players,
            'created_at': lobby.created_at,
        }
    except Exception as e:
        logger.error(f"Error while getting lobby data: {e}")
        return Response({"error": str(e)}, status=500)

def _get_ias_serializers(ia):
    try :
        ia_players = []
        for ia_player in ia:
            ia_players.append({
                'id': ia_player.id,
                'elo': ia_player.elo,
                'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp',
                'username': 'ia',
            })
        return ia_players
    except Exception as e:
        logger.error(f"Error while getting ia data: {e}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getAvailableUserToLobby(request):
    try:
        lobbyUUID = request.GET.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "Lobby UUID is required"}, status=400)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        if not lobby:
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        playerAlreadyInLobby = lobby.players_ids
        userLst = _fetch_all_player_data_exclude(playerAlreadyInLobby)
        return Response(userLst, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@login_required
def addPlayerToLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        userId = request.data.get('userId')
        if not lobbyUUID or not userId:
            return Response({"error": "lobbyUUID and userId are required"}, status=400)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        if not lobby:
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        if userId in lobby.players_ids:
            return Response({"error": "User is already in the lobby"}, status=400)
        lobby.players_ids.append(userId)
        lobby.save()

        return Response({"message": "Player added to the lobby"}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@login_required
def addIaToLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "lobbyUUID and userId are required"}, status=400)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        if not lobby:
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        newIa = AIPlayer.objects.create()
        lobby.ai_players.add(newIa)
        lobby.save()
        return Response({"lobby": 'a'}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)



# # def getAllParticipants(lobby):
# #     player_participants = lobby.players.all()
# #     ia_participants = lobby.ai_players.all()
# #     participants = []
# #     for player in player_participants:
# #         participant = {
# #             'id': player.id,
# #             'isIA': False,
# #             'username': player.username,
# #             'img': player.img
# #         }
# #         participants.append(participant)
    
# #     for ia in ia_participants:
# #         participant = {
# #             'id': ia.id,
# #             'isIA': True,
# #             'username': 'ia',
# #             'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp'
# #         }
# #         participants.append(participant)
# #     random.shuffle(participants)
# #     return participants


# # def decompositionProduitFactorPremier(n):
# #     facteurs = []
# #     i = 2
# #     while i <= n:
# #         if n % i == 0:
# #             facteurs.append(i)
# #             n = n // i
# #         else:
# #             i += 1
# #     return facteurs

# # def getNbrGame(nbrParticipants, DFP):
# #     if not DFP:
# #         return 0

# #     nbrGame = 0
# #     indexDFP = len(DFP) - 1
# #     while indexDFP >= 0:
# #         nbrGame += nbrParticipants / DFP[indexDFP]
# #         nbrParticipants = nbrParticipants / DFP[indexDFP]
# #         indexDFP -= 1
# #     return int(nbrGame)

# # def makeMatchMakingTournament(lobby, UUIDTournament):

# #     participants = getAllParticipants(lobby)
# #     nbrParticipants = len(participants)
# #     DFP = decompositionProduitFactorPremier(nbrParticipants)
# #     nbrGame = getNbrGame(nbrParticipants, DFP)
# #     nbrFirstGame = reduce(lambda x, y: x * y, DFP[:-1])
# #     nbrParticipantsForFirstGame = nbrParticipants // nbrFirstGame

# #     for i in range(nbrFirstGame):
# #         participantsForGame = participants[i*nbrParticipantsForFirstGame:(i+1)*nbrParticipantsForFirstGame]
# #         userParticipating = []
# #         iaParticipating = []
# #         for participant in participantsForGame:
# #             if participant.get('isIA') == False:
# #                 userParticipating.append(Player.objects.get(id=participant.get('id')))
# #             else :
# #                 iaParticipating.append(AIPlayer.objects.get(id=participant.get('id')))
# #         Game_Tournament.objects.create(UUID_TOURNAMENT=Tournament.objects.get(UUID=UUIDTournament))
# #         game = Game_Tournament.objects.last()
# #         game.players.set(userParticipating)
# #         game.ai_players.set(iaParticipating)
# #         game.save()
# #     nbrOtherGame = nbrGame - nbrFirstGame
# #     for i in range(nbrOtherGame):
# #         Game_Tournament.objects.create(UUID_TOURNAMENT=Tournament.objects.get(UUID=UUIDTournament))

# # def get_nbr_party_by_tour(nbr_participants, tour, DFP):
# #     if len(DFP) == 0:
# #         return 0

# #     nbr_game = 0
# #     index_DFP = len(DFP) - 1
# #     i = 0
# #     while index_DFP >= 0 and i < tour:
# #         nbr_game = nbr_participants / DFP[index_DFP]
# #         nbr_participants = nbr_participants / DFP[index_DFP]
# #         index_DFP -= 1
# #         i += 1
# #     return int(nbr_game)

# # def getAllGamesAtTurn(indexFirstGame, turn, DFP, nbrParticipants):
# #     try :
# #         # logger.info('====================> GET ALL GAMES AT TURN')
# #         # logger.info(f"      indexFirstGame [{indexFirstGame}]")
# #         # logger.info(f"      turn [{turn}]")
# #         # logger.info(f"      DFP [{DFP}]")
# #         # logger.info(f"      nbrParticipants [{nbrParticipants}]")
# #         gameTab = []
# #         nbrGame = 0
# #         for i in range(turn):
# #             nbrGame += get_nbr_party_by_tour(nbrParticipants, i, DFP)
# #         indexFirstGame += nbrGame
# #         nbrGame = get_nbr_party_by_tour(nbrParticipants, turn, DFP)
# #         for i in range(nbrGame):
# #             gameTab.append(Game_Tournament.objects.get(id=indexFirstGame + i))
# #             # logger.info(f"      game [{Game_Tournament.objects.get(id=indexFirstGame + i)}]")
# #         # logger.info('====================> END OF GET ALL GAMES AT TURN')
# #         return gameTab
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)

# # def count_divisions_by_n(number, n):
# #     count = 0
# #     while number > n:
# #         number /= n
# #         count += 1
# #     return count

# # def setNextGameForGame(currentGame, nextGames, cptLeft, cptRight):
# #     try :
# #         nextGameId = None
# #         logger.info('====================> SET NEXT GAME FOR GAME')
# #         # logger.info(f"      nextGames [{nextGames}]")
# #         # logger.info(f"      nextGamesCOUnt [{len(nextGames)}]")
# #         logger.info(f"      DEBOG => cptLeft [{cptLeft}] - cptRight [{cptRight}]")
# #         if not nextGames:
# #             logger.info('   NO NEXT GAME')
# #             return
# #         if len(nextGames) == 1:
# #             currentGame.next_game = nextGames[0]
# #             currentGame.save()
# #             return
# #         logger.info(f"      currentGame.id [{currentGame.id}]")
# #         if (currentGame.id % 2) == 0:
# #             for nGame in nextGames:
# #                 if nGame.id % 2 == 0 and nGame.id != currentGame.id :
# #                     if cptLeft <= 2:
# #                         nextGameId = nGame.id
# #                     else:
# #                         cpt = count_divisions_by_n(cptLeft, 2)  
# #                         logger.info(f"      nbrDivBy2 Left [{cpt}]")
# #                         logger.info(f"      nGame.id[{nGame.id}] + cpt*2[{cpt * 2}] = [{nGame.id + ( cpt * 2)}]")
# #                         nextGameId = nGame.id + ( cpt * 2)
# #                     break
# #         else:
# #             for nGame in nextGames:
# #                 if nGame.id % 2 != 0 and nGame.id != currentGame.id:
# #                     if cptRight <= 2:
# #                         nextGameId = nGame.id
# #                     else:
# #                         cpt = count_divisions_by_n(cptRight, 2)
# #                         logger.info(f"      nbrDivBy2 right [{cpt}]")
# #                         logger.info(f"      nGame.id[{nGame.id}] + cpt*2[{cpt * 2}] = [{nGame.id + ( cpt * 2)}]")
# #                         nextGameId = nGame.id + ( cpt * 2)
# #                     break
# #         if nextGameId:
# #             logger.info(f"      nextGameId [{nextGameId}]")
# #             currentGame.next_game = Game_Tournament.objects.get(id=nextGameId)
# #             currentGame.save()
# #         logger.info('====================> END SET NEXT GAME FOR GAME')
# #     except Exception as e:
# #         logger.info(f'   ERROR{e}')
# #         return Response({"error": str(e)}, status=500)

# # def setNextGamePerGame(lobby):
# #     try :
# #         logger.info('====================> SET NEXT GAME')
# #         participants = getAllParticipants(lobby)
# #         nbrParticipants = len(participants)
# #         DFP = decompositionProduitFactorPremier(nbrParticipants)
# #         games = Game_Tournament.objects.filter(UUID_TOURNAMENT__UUID_LOBBY=lobby)
# #         games = games.order_by('id')
# #         nbrTour = len(DFP)
# #         gameIndex = games.first().id
# #         firstGameId = gameIndex

# #         logger.info(f"  games [{games}]")
# #         logger.info(f"  nbrParticipants [{nbrParticipants}]")
# #         logger.info(f"  DFP [{DFP}]")
# #         logger.info(f"  nbrTour [{nbrTour}]")
# #         logger.info(f"  gameIndex [{gameIndex}]")

# #         cptLeft = 0
# #         cptRight = 0


# #         for i in range(1, nbrTour):
# #             nextGames = getAllGamesAtTurn(firstGameId, i + 1, DFP, nbrParticipants)
# #             nbrGameByTour = get_nbr_party_by_tour(nbrParticipants, i, DFP)
# #             logger.info(f"  nbr game for [{i}]: {nbrGameByTour}")
# #             for j in range(nbrGameByTour):
# #                 Currentgame = games.get(id=gameIndex)
# #                 Currentgame.layer = i
# #                 Currentgame.save()
# #                 # logger.info(f"      Currentgame [{Currentgame}]")
# #                 # logger.info(f"      nextGames [{nextGames}]")
# #                 if (Currentgame.id % 2) == 0:
# #                     cptLeft += 1
# #                 else:
# #                     cptRight += 1
# #                 setNextGameForGame(Currentgame, nextGames, cptLeft, cptRight)
# #                 gameIndex += 1
# #             cptLeft = 0
# #             cptRight = 0
# #         logger.info('====================> END OF SET NEXT GAME')  
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@login_required
def lockLobby(request):
    try:
        logger.info('====================> LOCK LOBBY')
        lobbyUUID = request.data.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "Lobby UUID is required"}, status=400)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        if not lobby:
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        lobby.locked = True
        lobby.save()

        if not Tournament.objects.filter(UUID_LOBBY=lobby).exists() or not Game_Tournament.objects.filter(UUID_TOURNAMENT__UUID_LOBBY=lobby).exists():
            Tournament.objects.create(UUID_LOBBY=lobby)
            tournament = Tournament.objects.get(UUID_LOBBY=lobby)
            makeMatchMakingTournament(lobby, tournament.UUID)
            setNextGamePerGame(lobby)
        else:
            tournament = Tournament.objects.get(UUID_LOBBY=lobby)
            setNextGamePerGame(lobby) #A RETIRER

        tournamentOrganized = {}
        tournamentOrganized['UUID'] = tournament.UUID
        tournamentOrganized['games'] = []

        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        for game in games:
            gameData = {}
            gameData['id'] = game.id
            gameData['winner_player'] = game.winner_player.id if game.winner_player else None
            gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
            gameData['next_game'] = game.next_game.id if game.next_game else None
            gameData['layer'] = game.layer
            gameData['players'] = []
            for player in game.players.all():
                gameData['players'].append(player.id)
            for ia in game.ai_players.all():
                gameData['players'].append(ia.id)
            tournamentOrganized['games'].append(gameData)
        return Response({"tournament": tournamentOrganized}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# # ===============================================================================================
# # ============================================ UTILS ============================================
# # ===============================================================================================

# # @csrf_exempt
# # @api_view(['GET'])
# # @login_required
# # def getTournamentInfo(request):
# #     try:
# #         UUID_TOURNAMENT = request.GET.get('tournamentUUID')
# #         tournament = Tournament.objects.get(UUID=UUID_TOURNAMENT)
# #         games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
# #         games = games.order_by('id')
# #         tournamentOrganized = {}
# #         tournamentOrganized['UUID'] = tournament.UUID
# #         tournamentOrganized['games'] = []

# #         for game in games:
# #             gameData = {}
# #             gameData['id'] = game.id
# #             gameData['winner_player'] = game.winner_player.id if game.winner_player else None
# #             gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
# #             gameData['next_game'] = game.next_game.id if game.next_game else None
# #             gameData['layer'] = game.layer
# #             gameData['players'] = []
# #             for player in game.players.all():
# #                 logger.info(player)
                
# #                 gameData['players'].append({
# #                     'id': player.id,
# #                     'is_ai': False,
# #                     'username': player.username,
# #                     'img': str(player.img)
# #                 })
                
# #             for ia in game.ai_players.all():
# #                 gameData['players'].append({
# #                     'id': ia.id,
# #                     'is_ai': True,
# #                     'username': 'ia',
# #                     'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp'
# #                 })
# #             tournamentOrganized['games'].append(gameData)

# #         return Response({"gameTournament": tournamentOrganized['games']}, status=200)
# #     except Tournament.DoesNotExist:
# #         return Response({"error": f"Tournament does not exist for lobby with id {UUID_TOURNAMENT}"}, status=404)
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)

# # @csrf_exempt
# # @api_view(['POST'])
# # @login_required
# # def setWinnerAtTournamentGame(request):
# #     try :
# #         id = request.data.get('contactId')

# #         gameId = request.data.get('idGame')
# #         winnerId = request.data.get('idWinner')
# #         isAI = request.data.get('isIa')
# #         game = Game_Tournament.objects.get(id=gameId)
# #         if isAI == 'True':
# #             winner = AIPlayer.objects.get(id=winnerId)
# #             game.winner_ai = winner
# #         else:
# #             winner = Player.objects.get(id=winnerId)
# #             game.winner_player = winner
# #         game.save()
# #         nextGame = game.next_game
# #         if nextGame :
# #             if isAI == 'True':
# #                 nextGame.ai_players.add(winner)
# #             else:
# #                 nextGame.players.add(winner)
# #         return Response({"game": game.id}, status=200)
# #     except Game_Tournament.DoesNotExist:
# #         return Response({"error": f"Game with id {gameId} does not exist"}, status=404)
# #     except Player.DoesNotExist:
# #         return Response({"error": f"Player with id {winnerId} does not exist"}, status=404)
# #     except AIPlayer.DoesNotExist:
# #         return Response({"error": f"AIPlayer with id {winnerId} does not exist"}, status=404)
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)


# # def getCurrentLayer(tournament):
# #     games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
# #     games = games.order_by('id')
# #     for game in games:
# #         if game.winner_ai is None and game.winner_player is None:
# #             return game.layer
# #     return -1

# # @csrf_exempt
# # @api_view(['GET'])
# # @login_required
# # def finishGameOnlyIa(request):
# #     try:
# #         logger.info('====================> finishGameOnlyIa')
# #         lobbyUUID = request.GET.get('lobbyUUID')
# #         lobby = Lobby.objects.get(UUID=lobbyUUID)
# #         tournament = Tournament.objects.get(UUID_LOBBY=lobby)
# #         layer = getCurrentLayer(tournament)
# #         logger.info(f"   layer [{layer}]")
# #         games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
# #         games = games.filter(layer=layer)
# #         for game in games:
# #             if game.players.count() == 0 and game.ai_players.count() == 2:
# #                 logger.info(f"          gameWiniS")
# #                 game.winner_ai = game.ai_players.first()
# #                 game.save()
# #                 nextGame = game.next_game
# #                 if nextGame:
# #                     nextGame.ai_players.add(game.winner_ai)

# #         return Response({"message": "All games with only IA player have been finished"}, status=200)
# #     except Lobby.DoesNotExist:
# #         return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
# #     except tournament.DoesNotExist:
# #         return Response({"error": f"Tournament with id {lobbyUUID} does not exist"}, status=404)
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)

# # @csrf_exempt
# # @api_view(['GET'])
# # @login_required
# # def getLobbyIsLocked(request):
# #     try :
# #         logger.info('====================> GET LOBBY IS LOCKED')
# #         lobbyUUID = request.GET.get('lobbyUUID')
# #         logger.info(f"   lobbyUUID [{lobbyUUID}]")
# #         lobby = Lobby.objects.get(UUID=lobbyUUID)
# #         logger.info(f"   lobby [{lobby}]")
# #         logger.info(f"   locked [{lobby.locked}]")
# #         return Response({"locked": lobby.locked}, status=200)
# #     except Exception as e:
# #         return Response({"error": str(e)}, status=500)

# # ===============================================================================================
# # ========================================= GAME Custom =========================================
# # ===============================================================================================

# @csrf_exempt
# @api_view(['POST'])
# @login_required
# def setSessionPongCustomGame(request):
#     try:
#         pongCustom = request.data.get('pongCustom')
#         logger.info('=======================')
#         logger.info(pongCustom)
#         request.session['customPong_data'] = pongCustom
#         logger.info('custom save at session')
#         logger.info(request.session['customPong_data'])
#         return JsonResponse({'status': 'success', 'message': 'Custom game saved.'}, status=200)
#     except Exception as e:
#         return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @csrf_exempt
# @api_view(['GET'])
# @login_required
# def getSessionPongCustomGame(request):
#     try:
#         if 'customPong_data' not in request.session:
#             return JsonResponse({'status': 'error', 'message': 'No custom game data found in session.'}, status=200)
        
#         customPong_data = request.session['customPong_data']
#         return JsonResponse({"customGame": {
#             "custom_ball": customPong_data.get('custom_ball'),
#             "custom_plateau": customPong_data.get('custom_plateau'),
#             "custom_paddle": customPong_data.get('custom_paddle'),
#             "custom_map": customPong_data.get('custom_map'),
#             "custom_score": customPong_data.get('custom_score'),
#             "custom_animation": customPong_data.get('custom_animation'),
#         }}, status=200)
#     except Exception as e:
#         return JsonResponse({'statusawef': 'error', 'message': str(e)}, status=500)

# @csrf_exempt
# @api_view(['POST'])
# @login_required
# def setPongCustomGame(request):
#     try:
#         idGame = request.data.get('idGame')
#         customPong_data = request.data.get('data')
#         logger.info('idgame')
#         logger.info(idGame)
#         logger.info('custome data')
#         logger.info(customPong_data)


#         pong_custom_game = PongCustomGame.objects.create(
#             custom_ball=customPong_data.get('custom_ball'),
#             custom_plateau=customPong_data.get('custom_plateau'),
#             custom_paddle=customPong_data.get('custom_paddle'),
#             custom_map=customPong_data.get('custom_map'),
#             custom_score=customPong_data.get('custom_score'),
#             custom_animation=customPong_data.get('custom_animation'),
#         )

#         if idGame == -1:
#             return JsonResponse({"customGame": {
#                 "idCustom": pong_custom_game.id,
#                 "custom_ball": pong_custom_game.custom_ball,
#                 "custom_plateau": pong_custom_game.custom_plateau,
#                 "custom_paddle": pong_custom_game.custom_paddle,
#                 "custom_map": pong_custom_game.custom_map,
#                 "custom_score": pong_custom_game.custom_score,
#                 "custom_animation": pong_custom_game.custom_animation,
#             }}, status=200)
#         game = Game.objects.latest('created_at')
#         game.custom_game = pong_custom_game
#         game.save()

#         return JsonResponse({'status': 'success', 'message': 'Custom game saved.'}, status=200)

#     except Game.DoesNotExist:
#         return JsonResponse({'status': 'error', 'message': 'Game not found.'}, status=500)
#     except Exception as e:
#         return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @csrf_exempt
# @api_view(['GET'])
# @login_required
# def getPongCustomData(request):
#     try:
#         idCustomGame = request.GET.get('idCustomGame')
#         if not idCustomGame:
#             return JsonResponse({"error": "L'ID du jeu personnalisé est requis"}, status=400)
#         pong_custom_game = PongCustomGame.objects.get(id=idCustomGame)
        
#         custom_game_data = {
#             "idCustom": pong_custom_game.id,
#             "custom_ball": pong_custom_game.custom_ball,
#             "custom_plateau": pong_custom_game.custom_plateau,
#             "custom_paddle": pong_custom_game.custom_paddle,
#             "custom_map": pong_custom_game.custom_map,
#             "custom_score": pong_custom_game.custom_score,
#             "custom_animation": pong_custom_game.custom_animation,
#         }
#         return JsonResponse({"customGame": custom_game_data}, status=200)
#     except PongCustomGame.DoesNotExist:
#         return JsonResponse({"error": "Jeu personnalisé non trouvé"}, status=404)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)

# # ===============================================================================================
# # ========================================== GAME MANDA =========================================
# # ===============================================================================================



# def generate_random_games():
#     # Supprimer les anciennes données
#     Game.objects.all().delete()
#     PlayerGame.objects.all().delete()
    
#     # IDs des joueurs
#     player_ids = [1, 2, 3]
#     players = {player.id: player for player in Player.objects.filter(id__in=player_ids)}
#     Player.objects.all().update(eloPong=1000)
#     # Générer 40 parties
#     for i in range(20):
        
#         # Sélectionner un gagnant aléatoire parmi les joueurs
#         winner_id = random.choice(player_ids)
        
#         # Créer une nouvelle partie
#         game = Game.objects.create(
#             type='Pong',
#             finish=True,
#             time=random.randint(20, 500),
#             winner_id=winner_id,
#             created_at=timezone.now()
#         )
        
#         # Initialiser l'Elo avant la partie
#         elo_before = {
#             player_id: players[player_id].eloPong for player_id in player_ids
#         }
        
#         # Facteur k pour ajuster l'Elo
#         k_factor = random.randint(10, 30)
#         for player_id in player_ids:
#             player = players[player_id]
            
#             # Calcul de l'ajustement de l'Elo
#             if player_id == winner_id:
#                 elo_change = k_factor
#             else:
#                 elo_change = -k_factor
            
#             # Empêcher l'Elo de devenir négatif
#             new_elo = max(0, elo_before[player_id] + elo_change)
            
#             # Créer une instance de PlayerGame
#             PlayerGame.objects.create(
#                 game=game,
#                 player_id=player_id,
#                 elo_before=elo_before[player_id],
#                 elo_after=new_elo
#             )
            
#             # Mettre à jour l'Elo du joueur
#             player.eloPong = new_elo
#             player.save()

#     return "40 games have been generated successfully!"



def _get_array_game_serializers(games):
    """
        Create a dictionary of games data.
        Args:
            games (Game): Array of the game object.
        Returns:
            dict: A dictionary containing game's details.
    """
    try:
        GamesSerializers = []
        for game in games:
            GamesSerializers.append(_get_game_serializers(game))
        return GamesSerializers
    except Exception as e:
        logger.info(f"Error _get_array_game_serializers: {e}")
        return None

def _get_game_serializers(game):
    """
        Create a dictionary of game data.
        Args:
            game (Game): The game object.
        Returns:
            dict: A dictionary containing game's details.
    """
    try:
        winner_data = None
        if game.winner_id:
            winner_data = _fetch_user_data(game.winner_id)
        all_player_ids = set()
        player_games = PlayerGame.objects.filter(game=game)
        for player_game in player_games:
            if player_game.player_id:
                all_player_ids.add(player_game.player_id)
        player_data_map = _fetch_users_data(list(all_player_ids))
        players_data = [
            {
                'player': player_data_map.get(str(player_game.player_id)),
                'elo_before': player_game.elo_before,
                'elo_after': player_game.elo_after,
            }
            for player_game in PlayerGame.objects.filter(game=game)
        ]
        data = {
            'uuidGame': game.UUID,
            'type': game.type,
            'players': players_data,
            'winner': winner_data, 
            'created_at': game.created_at,
            'time_minutes': game.time // 60,
            'time_seconds': game.time % 60,
        }
        return data
    except Exception as e:
        logger.info(f"Error _get_game_serializers: {e}")
        return None



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

def _fetch_all_player_data_exclude(exludes_ids: list[int]) -> dict:
    """
    Fetch all player data excluding blocked users.
    
    Args:
        exludes_ids (list[int]): A list of exlude user IDs.
    
    Returns:
        dict: The player data excluding blocked users or None if an error occurs.
    """
    exludes_ids_str = ','.join(map(str, exludes_ids))
    url = f"{BASE_URL}/api/getAllPlayerDataExcludeIds?excludeIds={exludes_ids_str}"
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