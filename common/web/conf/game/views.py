# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


import logging
logger = logging.getLogger('print')

# _____________________________________ Django Imports _____________________________________


from django.shortcuts import render
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from django.conf import settings


# _____________________________________ Local Application Imports _____________________________________


from users.login_required import login_required
from game.models import Game, Lobby, Tournament, Game_Tournament


# ======================================================================================================================
# ==================================================== Game Home  ======================================================
# ======================================================================================================================


@login_required
def gameHome(request):
    return render(request, "homeGame/homeGame.html")


# ======================================================================================================================
# ==================================================== PONG GAME  ======================================================
# ======================================================================================================================


# _____________________________________ Pong Local _____________________________________


@login_required
def pongLocal(request):
    dataUrl = request.GET.get('customId', '1')
    context = {'dataUrl': dataUrl}
    return render(request, "pongLocal/pongLocal.html", context)


# _____________________________________ Pong Ranked _____________________________________


@login_required
def pongRanked(request):
    return render(request, "pongRanked/pongRanked.html")


# _____________________________________ Pong Tournamenet  _____________________________________


@login_required
def pongTournament(request):
    return render(request, "pongTournament/pongTournamentHub.html")

@login_required
def pongTournamentLobby(request):
    try:
        userId = request.GET.get('userId', '-1')
        lobby_UUID = request.GET.get('lobby_id', '-1')
        # if userId == '-1' or lobby_UUID == '-1':
        #     return render(request, "pongTournament/pongTournamentHub.html", {"error": "User not found or lobby not found"})
        lobby = Lobby.objects.get(UUID=lobby_UUID)
        # if lobby is None or lobby.players.filter(id=userId).exists():
        #     return render(request, "pongTournament/pongTournamentLobby.html", {"lobby_UUID": lobby_UUID})
        # return render(request, "pongTournament/pongTournamentHub.html", {"error": "User not in lobby"})
        return render(request, "pongTournament/pongTournamentLobby.html", {"lobby_UUID": lobby_UUID})
    except Lobby.DoesNotExist:
        return render(request, "pongTournament/pongTournamentHub.html", {"error": "Lobby not found"})
    except Exception as e:
        logger.error(f"Error: {e}")
        return render(request, "pongTournament/pongTournamentHub.html", {"error": "An unexpected error occurred"})

# @login_required
# def pongTournamentGame(request):
#     try:
#         user = request.user
#         player = Player.objects.get(username=user.username)
#         lobbyUUID = request.GET.get('lobby_id', 'default_value')
#         tournament = Tournament.objects.get(UUID_LOBBY=lobbyUUID)
#         games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)

#         gameId = -1
#         for game in games:
#             if game.players.filter(id=player.id).exists() or game.ai_players.filter(id=player.id).exists():
#                 if game.winner_player is None and game.winner_ai is None:
#                     gameId = game.id
#                     break
        
#         if gameId == -1:
#             return render(request, "pongTournament/pongTournament_full.html", {"error": "Game not found"})
        

#         game = Game_Tournament.objects.get(id=gameId)
#         participantsPlayer = game.players.all()
#         participantsAI = game.ai_players.all()
#         participants = []
#         for player in participantsPlayer:
#             participants.append({
#                 'id': player.id,
#                 'username': player.username,
#                 'img': player.img
#             })
#         for player in participantsAI:
#             participants.append({
#                 'id': player.id,
#                 'username': 'ia',
#                 'img': 'ia'
#             })

#         return render(request, "pongTournament/pongTournamentGame.html", {'userId': 0, 'game': game, 'participants': participants})
#     except Exception as e:
#         return render(request, "pongTournament/pongTournamentHub.html", {"error": "Game not found"})


# _____________________________________ Pong IA _____________________________________


@login_required
def pongIa(request):
    return render(request, "pongIa/pongIa.html")


# _____________________________________ Pong Custom _____________________________________


@login_required
def pongCustom(request):
    data_url = request.GET.get('data-url', 'none')
    context = {'data_url': data_url}
    return render(request, "pongCustom/pongCustom.html", context)


# _____________________________________ Pong PrivGame _____________________________________


@login_required
def pongPrivGame(request):
    # data = {
    #     'player' : {
    #         'id': player.id,
    #         'username': player.username,
    #         'img': player.img,
    #     },
    #     'opponent' : {
    #         'id': opponent.id,
    #         'username': opponent.username,
    #         'img': opponent.img,
    #     },
    #     'game': {
    #         'id': privGame.UUID,
    #         'type': privGame.type,
    #         'finish': privGame.finish,
    #         'p1Id': privGame.player1.id,
    #         'p2Id' : privGame.player2.id,
    #     }
    # }
    try :
        gameUUID = request.GET.get('gameUUID', '-1')
        logger.info(f"gameUUID: {gameUUID}")
        if gameUUID == '-1':
            logger.error(f"NO gameUUID: {gameUUID}")
            return render(request, "homeGame/homeGame.html")
        game = Game.objects.get(UUID=gameUUID)
        if game is None:
            logger.error(f"NO game: {game}")
            return render(request, "homeGame/homeGame.html")
        logger.info(f"game: {game}")
        context = {'gameUUID': game.UUID}
        return render(request, "pongPrivGame/pongPrivGame.html", context)
    except Exception as e:
        logger.error(f"Error: {e}")
        return render(request, "homeGame/homeGame.html")


# ======================================================================================================================
# ==================================================== UNO GAME  =======================================================
# ======================================================================================================================

# _____________________________________ UNO Local _____________________________________


# _____________________________________ UNO Ranked _____________________________________


# _____________________________________ UNO Tournamenet  _____________________________________


# _____________________________________ UNO IA _____________________________________


# _____________________________________ UNO Custom _____________________________________

