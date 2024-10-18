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
from game.models import Game, PlayerGame, Lobby, Game_Tournament, Tournament, PongCustomGame


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
            return Response({"message": "Game removed successfully"}, status=200)
        except Game.DoesNotExist:
            return Response({"message": "no need to remove the game"}, status=200)
    except Exception as e:
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
        return Response(str(new_game.UUID), status=200)
    except Exception as e:
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
        if not playerId:
            return Response({"error": "Player ID is required"}, status=400)
        lobbys = Lobby.objects.filter(players_ids__contains=[playerId]).order_by('created_at')
        tab = [_get_lobby_serializers(lobby) for lobby in lobbys]
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
    return {
        'UUID': str(lobby.UUID),
        'name': lobby.name,
        'isLocked': lobby.locked,
        'owner_id': lobby.owner_id,
        'players_ids': lobby.players_ids,
        'ia_players_ids': lobby.ia_ids,
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
        return Response({"data": data}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error getLobbyData": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error getLobbyData": str(e)}, status=500)

def _get_lobby_data_serializers(lobby):
    try :
        human_player = _fetch_users_data(lobby.players_ids)
        ia_players = _get_ias_serializers(lobby.ia_ids)
        tournanmentUUID = None
        if Tournament.objects.filter(UUID_LOBBY=lobby).exists():
            tournanmentUUID = Tournament.objects.get(UUID_LOBBY=lobby).UUID
        return {
            'UUID': str(lobby.UUID),
            'name': lobby.name,
            'isLocked': lobby.locked,
            'owner_id': lobby.owner_id,
            'human_player': human_player,
            'ia_players': ia_players,
            'created_at': lobby.created_at,
            'tournamentUUID': tournanmentUUID,
        }
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _get_ias_serializers(ias):
    try :
        ia_players = []
        for _ in ias:
            ia_players.append({
                'id': -1,
                'elo': 1000,
                'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp',
                'username': 'ia',
            })
        return ia_players
    except Exception as e:
        return Response({"error": str(e)}, status=505)

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
        lobby.ia_ids.append(-1)
        lobby.save()
        return Response({"lobby": 'a'}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ===============================================================================================
# ========================================== Tournament =========================================
# ===============================================================================================


@csrf_exempt
@api_view(['POST'])
@login_required
def lockLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        if not lobbyUUID:
            return Response({"error": "Lobby UUID is required"}, status=400)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        if not lobby:
            return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
        lobby.locked = True
        lobby.save()

        if not Tournament.objects.filter(UUID_LOBBY=lobby).exists():
            tournament = Tournament.objects.create(UUID_LOBBY=lobby)
            _makeMatchMakingTournament(lobby, tournament)
        else:
            tournament = Tournament.objects.get(UUID_LOBBY=lobby)
        return Response({"tournamentUUID": tournament.UUID}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _makeMatchMakingTournament(lobby, tournament):
    try :
        participants = _getAllParticipants(lobby)
        nbrParticipants = len(participants)
        DFP = _primeFactors(nbrParticipants)
        nbrLayer = len(DFP)
        nexGame = []
        for i in range(nbrLayer, 0, -1):
            currentGame = []
            for j in range(_getNbrGameByTour(nbrParticipants, i, DFP)):
                newGame = Game_Tournament.objects.create(UUID_TOURNAMENT=tournament, layer=i)
                nextGame = _getNextGameId(nexGame)
                if nextGame: newGame.next_game = Game_Tournament.objects.get(id=nextGame)
                currentGame.append({'id' : newGame.id, 'max': _getNbrParticipantsByGameByTour(i, DFP), 'current': 0})
                if i == 1:
                    for _ in range(_getNbrParticipantsByGameByTour(i, DFP)):
                        participant = participants.pop(0)
                        if participant.get('isIA'):
                            newGame.ia_ids.append(participant.get('id'))
                        else:
                            newGame.players_ids.append(participant.get('id'))
                newGame.save()
                tournament.games.add(newGame)
                tournament.save()
            nexGame = currentGame
    except Exception as e:
        return Response({"error _makeMatchMakingTournament": str(e)}, status=500)

def _getAllParticipants(lobby):
    try:
        participants = [
            {'id': player_id, 'isIA': False} for player_id in lobby.players_ids
        ] + [
            {'id': -1, 'isIA': True} for _ in lobby.ia_ids
        ]
        random.shuffle(participants)
        return participants
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _primeFactors(n):
    facteurs = []
    i = 2
    while i <= n:
        if n % i == 0:
            facteurs.append(i)
            n = n // i
        else:
            i += 1
    return (facteurs)

def _getNbrGameByTour(nbrParticipants, layer, DFP):
    if not DFP:
        return 0

    nbrGame = 0
    indexDFP = len(DFP) - 1
    i = 0
    while indexDFP >= 0 and i < layer:
        nbrGame = nbrParticipants / DFP[indexDFP]
        nbrParticipants = nbrParticipants / DFP[indexDFP]
        indexDFP -= 1
        i += 1
    return int(nbrGame)

def _getNextGameId(nextGame):
    try :
        if not nextGame : return None
        for game in nextGame:
            if game.get('current') < game.get('max'):
                game.update({'current': game.get('current') + 1})
                return game.get('id')
        return None
    except Exception as e:
        return None

def _getNbrParticipantsByGameByTour(layer, DFP):
    if not DFP:
        return 0
    return int(DFP[len(DFP) - layer])


@csrf_exempt
@api_view(['GET'])
@login_required
def getTournamentDataByUUID(request):
    try:
        tournamentUUID = request.GET.get('tournamentUUID')
        if not tournamentUUID:
            return Response({"error": "Tournament UUID is required"}, status=400)
        tournament = Tournament.objects.get(UUID=tournamentUUID)
        data = _get_tournament_data_serializers(tournament)
        return Response(data, status=200)
    except Tournament.DoesNotExist:
        return Response({"error": f"Tournament does not exist for lobby with id {tournamentUUID}"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _getNbrLayer(tournament):
    try:
        maxLayer = 0
        for game in tournament.games.all():
            if game.layer > maxLayer:
                maxLayer = game.layer
        return maxLayer
    except Exception as e:
        return -1


# ===============================================================================================
# ============================================ UTILS ============================================
# ===============================================================================================


# @csrf_exempt
# @api_view(['POST'])
# @login_required
# def setWinnerAtTournamentGame(request):
#     try :
#         id = request.data.get('contactId')

#         gameId = request.data.get('idGame')
#         winnerId = request.data.get('idWinner')
#         isAI = request.data.get('isIa')
#         game = Game_Tournament.objects.get(id=gameId)
#         if isAI == 'True':
#             winner = AIPlayer.objects.get(id=winnerId)
#             game.winner_ai = winner
#         else:
#             winner = Player.objects.get(id=winnerId)
#             game.winner_player = winner
#         game.save()
#         nextGame = game.next_game
#         if nextGame :
#             if isAI == 'True':
#                 nextGame.ai_players.add(winner)
#             else:
#                 nextGame.players.add(winner)
#         return Response({"game": game.id}, status=200)
#     except Game_Tournament.DoesNotExist:
#         return Response({"error": f"Game with id {gameId} does not exist"}, status=404)
#     except Player.DoesNotExist:
#         return Response({"error": f"Player with id {winnerId} does not exist"}, status=404)
#     except AIPlayer.DoesNotExist:
#         return Response({"error": f"AIPlayer with id {winnerId} does not exist"}, status=404)
#     except Exception as e:
#         return Response({"error": str(e)}, status=500)


# def getCurrentLayer(tournament):
#     games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
#     games = games.order_by('id')
#     for game in games:
#         if game.winner_ai is None and game.winner_player is None:
#             return game.layer
#     return -1

# @csrf_exempt
# @api_view(['GET'])
# @login_required
# def finishGameOnlyIa(request):
#     try:
#         logger.info('====================> finishGameOnlyIa')
#         lobbyUUID = request.GET.get('lobbyUUID')
#         lobby = Lobby.objects.get(UUID=lobbyUUID)
#         tournament = Tournament.objects.get(UUID_LOBBY=lobby)
#         layer = getCurrentLayer(tournament)
#         logger.info(f"   layer [{layer}]")
#         games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
#         games = games.filter(layer=layer)
#         for game in games:
#             if game.players.count() == 0 and game.ai_players.count() == 2:
#                 logger.info(f"          gameWiniS")
#                 game.winner_ai = game.ai_players.first()
#                 game.save()
#                 nextGame = game.next_game
#                 if nextGame:
#                     nextGame.ai_players.add(game.winner_ai)

#         return Response({"message": "All games with only IA player have been finished"}, status=200)
#     except Lobby.DoesNotExist:
#         return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
#     except tournament.DoesNotExist:
#         return Response({"error": f"Tournament with id {lobbyUUID} does not exist"}, status=404)
#     except Exception as e:
#         return Response({"error": str(e)}, status=500)





# ===============================================================================================
# ========================================= GAME Custom =========================================
# ===============================================================================================

@csrf_exempt
@api_view(['POST'])
@login_required
def setSessionPongCustomGame(request):
    try:
        pongCustom = request.data.get('pongCustom')
        request.session['customPong_data'] = pongCustom
        return JsonResponse({'status': 'success', 'message': 'Custom game saved.'}, status=200)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def getSessionPongCustomGame(request):
    try:
        if 'customPong_data' not in request.session:
            return JsonResponse({'status': 'error', 'message': 'No custom game data found in session.'}, status=200)
        customPong_data = request.session['customPong_data']
        return JsonResponse({"customGame": {
            "custom_ball": customPong_data.get('custom_ball'),
            "custom_plateau": customPong_data.get('custom_plateau'),
            "custom_paddle": customPong_data.get('custom_paddle'),
            "custom_map": customPong_data.get('custom_map'),
            "custom_score": customPong_data.get('custom_score'),
            "custom_animation": customPong_data.get('custom_animation'),
        }}, status=200)
    except Exception as e:
        return JsonResponse({'statusawef': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@login_required
def setPongCustomGame(request):
    try:
        idGame = request.data.get('idGame')
        customPong_data = request.data.get('data')
        pong_custom_game = PongCustomGame.objects.create(
            custom_ball=customPong_data.get('custom_ball'),
            custom_plateau=customPong_data.get('custom_plateau'),
            custom_paddle=customPong_data.get('custom_paddle'),
            custom_map=customPong_data.get('custom_map'),
            custom_score=customPong_data.get('custom_score'),
            custom_animation=customPong_data.get('custom_animation'),
        )
        if idGame == -1:
            return JsonResponse({"customGame": {
                "idCustom": pong_custom_game.id,
                "custom_ball": pong_custom_game.custom_ball,
                "custom_plateau": pong_custom_game.custom_plateau,
                "custom_paddle": pong_custom_game.custom_paddle,
                "custom_map": pong_custom_game.custom_map,
                "custom_score": pong_custom_game.custom_score,
                "custom_animation": pong_custom_game.custom_animation,
            }}, status=200)
        game = Game.objects.latest('created_at')
        game.custom_game = pong_custom_game
        game.save()
        return JsonResponse({'status': 'success', 'message': 'Custom game saved.'}, status=200)
    except Game.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Game not found.'}, status=500)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def getPongCustomData(request):
    try:
        idCustomGame = request.GET.get('idCustomGame')
        if not idCustomGame:
            return JsonResponse({"error": "L'ID du jeu personnalisé est requis"}, status=400)
        pong_custom_game = PongCustomGame.objects.get(id=idCustomGame)
        
        custom_game_data = {
            "idCustom": pong_custom_game.id,
            "custom_ball": pong_custom_game.custom_ball,
            "custom_plateau": pong_custom_game.custom_plateau,
            "custom_paddle": pong_custom_game.custom_paddle,
            "custom_map": pong_custom_game.custom_map,
            "custom_score": pong_custom_game.custom_score,
            "custom_animation": pong_custom_game.custom_animation,
        }
        return JsonResponse({"customGame": custom_game_data}, status=200)
    except PongCustomGame.DoesNotExist:
        return JsonResponse({"error": "Jeu personnalisé non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# # ===============================================================================================
# # ========================================== GAME MANDA =========================================
# # ===============================================================================================





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
        return None


def _get_tournament_data_serializers(tournament):
    try:
        data = {
            'UUID': str(tournament.UUID),
            'lobby_id': tournament.UUID_LOBBY.UUID,
            'created_at': tournament.created_at,
            'games': _get_array_game_tournament_serializers(tournament.games.all()),
            'nbrLayer': _getNbrLayer(tournament),
            'nbrPlayers': len(tournament.UUID_LOBBY.players_ids + tournament.UUID_LOBBY.ia_ids),
        }
        return data
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def _get_array_game_tournament_serializers(games):
    try:
        GamesSerializers = []
        for game in games:
            GamesSerializers.append(_get_game_tournament_serializers(game))
        return GamesSerializers
    except Exception as e:
        return None

def _get_game_tournament_serializers(game):
    try:
        winner_data = None
        userData = []
        if game.winner_id:
            winner_data = _fetch_user_data(game.winner_id)
        if game.players_ids:
            userData = _fetch_users_data(game.players_ids)
        return {
            'id': game.id,
            'uuid_tournament': str(game.UUID_TOURNAMENT.UUID),
            'players': userData,
            'ia_players': _get_ias_serializers(game.ia_ids),
            'winner': winner_data,
            'created_at': game.created_at,
            'next_game': str(game.next_game.id) if game.next_game else None,
            'layer': game.layer,
            'custom_game': game.custom_game,
        }
    except Exception as e:
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