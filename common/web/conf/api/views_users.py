# ========================================================================================================
# ============================================= Include  =================================================
# ========================================================================================================


# ______________________________ Include for [///] ___________________________________

import requests

from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from users.login_required import login_required

# ______________________________ Include for models apps ____________________________

from django.contrib.auth.models import User
from users.models import Player
from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from chat.models import Friends, Messages, GameInvitation, Notification

# ______________________________ Include Utils _____________________________________

import os
import re
import tempfile

from itertools import chain
from django.db.models import Q
from django.shortcuts import redirect
from django.urls import reverse


from rest_framework.decorators import parser_classes
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.db.models import IntegerField, Sum
from django.core.exceptions import ValidationError
from django.contrib import messages
from django.core import files
from django.db.models import Max
from datetime import timedelta
from datetime import datetime
from django.utils import timezone
from django.contrib.auth.hashers import make_password

# ========================================================================================================
# ============================================= Methode  =================================================
# ========================================================================================================



@api_view(['POST'])
def login_player(request):
    mail = request.POST.get("email")
    password = request.POST.get("pass")
    try:
        player = Player.objects.get(mail=mail)
        user = authenticate(request, username=player.username, password=password)
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            response = JsonResponse({'success': True, 'redirect_url': '/profil/'})
            response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)  # Set cookie for 7 days
            return response
        else:
            return JsonResponse({'success': False, 'error': 'Invalid email or password'})
    except Player.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Invalid email or password'})

@api_view(['POST'])
def register_player(request):
    try:
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("pass")
        if User.objects.filter(email=email).exists():
            raise ValidationError("Invialide credentials")
        if User.objects.filter(username=username).exists():
            raise ValidationError("Invialide credentials")
        if len(password) < 8:
            raise ValidationError("Password to low")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password to low")
        if not re.search(r'[a-z]', password):
            raise ValidationError("Password to low")
        if not re.search(r'\d', password):
            raise ValidationError("Password to low")
        user = User.objects.create_user(username=username, email=email, password=password)
        player = Player.objects.create(username=username, mail=email)
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        response = JsonResponse({'success': True, 'redirect_url': '/profil/'})
        response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)  # Set cookie for 7 days
        return response
    except ValidationError as e:
        return JsonResponse({'success': False, 'error': str(e.messages[0])})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required
def download_file_from_url(url):
    try:
        request = requests.get(url, stream=True)
    except requests.exceptions.RequestException as e:
        return None

    if request.status_code != requests.codes.ok:
        return None
    lf = tempfile.NamedTemporaryFile()
    for block in request.iter_content(1024 * 8):
        if not block:
            break
        lf.write(block)

    return files.File(lf)

@api_view(['GET'])
def register_42(request, format=None):
    hostname = request.get_host()
    redirect_uri = f"https://{hostname}:42424/api/register-42/"
    
    body = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("client_id"),
        "client_secret": os.getenv("client_secret"),
        "code": request.query_params["code"],
        "redirect_uri": redirect_uri
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    r = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    print(r)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get('https://api.intra.42.fr/v2/me', headers=headers, json=body)
    mail = r.json()["email"]
    username = r.json()["login"]
    password = make_password(token)
    try:
        u = User.objects.get(email=mail)
        u.set_password(password)
        u.save()
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        response = redirect('/profil/')
        response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)  # Set cookie for 7 days
    except User.DoesNotExist:
        data = User.objects.create_user(username, mail, password)
        player = Player.objects.create(username=data.username, mail=data.email, img=(r.json()["image"]["link"]))
        data.save()
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        response = redirect('/profil/')
        response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)  # Set cookie for 7 days
    return response

@login_required
def logout(request):
    auth_logout(request)
    response = redirect('/login/')
    response.set_cookie('userIsAuthenticated', 'false', max_age=7*24*60*60)  # Set cookie for 7 days
    return response

@login_required
@api_view(['POST'])
def update_img(request):
    if request.method == 'POST' and request.FILES.get('avatar'):
        avatar = request.FILES['avatar']
        user = request.user
        player = Player.objects.get(username=user)
        player.img = avatar
        player.save()
        return Response({'success': True, 'new_avatar_url': player.img.url})
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

from rest_framework.parsers import JSONParser

@api_view(['POST'])
@csrf_exempt
@login_required
@parser_classes([JSONParser])
def update_data(request):
    try:
        data = request.data
        username = data.get("username")
        email = data.get("email")
        u = User.objects.get(username=request.user)
        p = Player.objects.get(username=request.user)
        if u.email != email:
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Email already in use'}, status=201)
        if u.username != username:
            if User.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'error': 'Username already in use'}, status=201)
        u.username = username
        p.username = username
        u.email = email
        p.mail = email
        u.save()
        p.save()
        return JsonResponse({'success': True, 'new_username': username, 'new_email': email}, status=200)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

from django.contrib.auth.hashers import check_password

@api_view(['POST'])
@csrf_exempt
@login_required
def updatePassword(request):
    try:
        password_pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
        data = request.data
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        u = User.objects.get(username=request.user)
        if not u.check_password(old_password):
            return JsonResponse({'success': False, 'error': 'Invalide passowrd'}, status=201)
        if old_password == new_password:
            return JsonResponse({'success': False, 'error': 'New password cannot be the same as the old password'}, status=201)
        if new_password != confirm_password:
            return JsonResponse({'success': False, 'error': 'New password and confirmation password do not match'}, status=201)
        if not re.match(password_pattern, new_password):
            return JsonResponse({'success': False, 'error': 'New password to low'}, status=201)
        u.set_password(new_password)
        u.save()
        u.refresh_from_db()
        login(request, u, backend='django.contrib.auth.backends.ModelBackend')

        return JsonResponse({'success': True, 'message': 'Mot de passe mis à jour avec succès'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Utilisateur non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)



# =================================================================================================

import logging

logger = logging.getLogger('print')

@api_view(['GET'])
@login_required
def getNumberOfGames(request):
    try:

        id = request.query_params["user"]
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=id)
        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        games_count = games.count()
        return Response({'value': games_count}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def getCurrentElo(request):
    try:
        id = request.query_params["user"]
        typeGame = request.query_params["type"]

        player = Player.objects.get(id=id)
        if typeGame == "pong":
            return Response({'value': player.eloPong}, status=200)
        elif typeGame == "connect4":
            return Response({'value': player.eloConnect4}, status=200)
        else:
            return Response({'value': 0}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getMaxElo(request):
    try:
        id = request.query_params["user"]
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=id)

        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        max_elo = games.aggregate(Max('elo_after_player1'), Max('elo_after_player2'))
        return Response({'value': max(max_elo['elo_after_player1__max'], max_elo['elo_after_player2__max'])}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

@api_view(['GET'])
@login_required
def getAvgGameTime(request):
    try:
        id = request.query_params["user"]
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=id)
        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        total_time = games.aggregate(
            total_time=Sum('time', output_field=IntegerField())
        )['total_time']
        total_games = games.count()
        if total_time is None or total_games == 0:
            avg_time = timedelta(0)
        else:
            avg_time = total_time / total_games
        avg_time = timedelta(seconds=avg_time)
        total_seconds = int(avg_time.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        formatted_avg_time = f"{minutes}m {seconds}s"

        return Response({'value': formatted_avg_time}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getMaxWinStreak(request):
    try:
        id = request.query_params["user"]
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=id)
        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        win_streak = 0
        max_win_streak = 0
        for game in games:
            if game.winner == player:
                win_streak += 1
                if win_streak > max_win_streak:
                    max_win_streak = win_streak
            else:
                win_streak = 0
        return Response({'value': max_win_streak}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getWinrate(request):
    try:
        user_id = request.query_params.get('user')
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=user_id)
        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        
        wins = games.filter(winner=player).count()
        total_games = games.count()
        if total_games == 0:
            winrate = 0
        else:
            winrate = (wins / total_games) * 100
        winrate = round(winrate, 0)
        return JsonResponse({'winrate': winrate}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def lastGameIsWin(request):
    try:
        user_id = request.query_params.get('user')
        typeGame = request.query_params["type"]
        player = Player.objects.get(id=user_id)
        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        games.order_by('-created_at')
        if games.count() == 0:
            return JsonResponse({'value': False}, status=200)
        last_game = games[0]
        if last_game.winner == player:
            result = 'Win'
        else:
            result = 'Lose'
        return JsonResponse({'value': result}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@login_required
def getPlayerGameData(request):
    try:
        user_id = request.query_params.get('user')
        player = Player.objects.get(id=user_id)
        typeGame = request.query_params["type"]

        games = (Game.objects.filter(player1=player, finish=True, type=typeGame) | Game.objects.filter(player2=player, finish=True, type=typeGame))
        games.order_by('-created_at').reverse()

        data = []
        for game in games:
            game_data = {
                'player1': game.player1.username,
                'player2': game.player2.username,
                'time': f"{game.time // 60}:{game.time % 60:02d}",
                'winner': game.winner.username,
                'elo_before_player1': game.elo_before_player1,
                'elo_before_player2': game.elo_before_player2,
                'elo_after_player1': game.elo_after_player1,
                'elo_after_player2': game.elo_after_player2,
                'date': game.created_at.strftime('%Y-%m-%d'),
                'elo_after': game.elo_after_player1 if game.player1_id == user_id else game.elo_after_player2
            }
            data.append(game_data)

        return Response({'data': data}, status=200)
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def format_time(seconds):
    minutes = seconds // 60
    seconds = seconds % 60
    return f"{minutes:02}:{seconds:02}"

def getMatches(request):
    try:
        matches = Game.objects.all().order_by('-created_at')[:10]
        matches_data = []
        for match in matches:
            match_data = {
                'player1': {
                    'username': match.player1.username,
                },
                'player2': {
                    'username': match.player2.username,
                },
                'time': format_time(match.time),
                'winner': {
                    'username': match.winner.username,
                },
                'elo_before_player1': match.elo_before_player1,
                'elo_before_player2': match.elo_before_player2,
                'elo_after_player1': match.elo_after_player1,
                'elo_after_player2': match.elo_after_player2,
            }
            matches_data.append(match_data)

        return JsonResponse({'matches': matches_data}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def lastConnexion(request):
    try:
        user_id = request.query_params.get('user')
        player = Player.objects.get(id=user_id)
        last_connexion = player.lastConnexion
        if last_connexion is None:
            return JsonResponse({'value': 'Never'}, status=200)
        return JsonResponse({'value': last_connexion.strftime('%Y-%m-%d %H:%M:%S')}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)