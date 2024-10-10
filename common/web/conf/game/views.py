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
from game.models import Game


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
    return render(request, "pongTournament/pongTournament.html")

# @login_required
# def pongTournamentLobby(request):
#     try:
#         playerId = request.user.username
#         playerId = Player.objects.get(username=playerId).id
#         lobby_id = request.GET.get('lobby_id', 'default_value')
#         lobby = Lobby.objects.get(UUID=lobby_id)
#         players = lobby.players.all()
#         for player in players:
#             if hasattr(player, 'img') and player.img:
#                 img_path = str(player.img)
#                 if img_path.startswith('profile_pics/'):
#                     player.img = '/media/' + img_path
#         ia_players = lobby.ai_players.all()
#         if request.htmx:
#             return render(request, "pongTournament/pongTournamentLobby.html", {"lobby": lobby, "players": players, "ia_players": ia_players, 'userId': playerId})
#         return render(request, "pongTournament/pongTournamentLobby_full.html", {"lobby": lobby, "players": players, "ia_players": ia_players, 'userId': playerId})
#     except Lobby.DoesNotExist:
#         if request.htmx:
#             return render(request, "pongTournament/pongTournament.html", {"error": "Lobby not found"})
#         return render(request, "pongTournament/pongTournament_full.html", {"error": "Lobby not found"})
#     except Exception as e:
#         if request.htmx:
#             return render(request, "pongTournament/pongTournament.html", {"error": "An unexpected error occurred"})
#         return render(request, "pongTournament/pongTournament_full.html", {"error": "An unexpected error occurred"})

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
#         return render(request, "pongTournament/pongTournament.html", {"error": "Game not found"})


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

