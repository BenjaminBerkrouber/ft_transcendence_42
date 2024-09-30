# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import json
from django.utils.translation import gettext as _
from django.shortcuts import render
from rest_framework.response import Response
import requests
from django.contrib.auth.models import User
from django.core import serializers
from users.login_required import login_required, not_login_required
from django.contrib.auth import logout
import logging

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

logger = logging.getLogger('print')


@not_login_required
def login_view(request):
    context = {
        'no_footer': True,
    }
    if request.htmx:
        context = {
            'no_footer': True,
            'updateNav': True,
        }
        return render(request, 'login/login_view.html', context)
    return render(request, 'login/login_view_full.html', context)

@login_required
def profil_view(request, format=None):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        is42 = True
        if (player.img.name.startswith("profile_pics/")):
            is42 = False
        games = (Game.objects.filter(player1=player, finish=True, type="pong") | Game.objects.filter(player2=player, finish=True, type="pong"))
        games = games.order_by('-created_at')

        matches = []
        for game in games:
            game.player1.img.name = '/media/' + game.player1.img.name if game.player1.img.name.startswith("profile_pics/") else game.player1.img.name
            game.player2.img.name = '/media/' + game.player2.img.name if game.player2.img.name.startswith("profile_pics/") else game.player2.img.name
            total_seconds = game.time
            minutes, seconds = divmod(total_seconds, 60)
            match_data = {
                'player1_username': game.player1.username,
                'player2_username': game.player2.username,
                'p1_img': game.player1.img.name,
                'p2_img': game.player2.img.name,
                'time_minutes': minutes,
                'time_seconds': seconds,
                'winner_username': game.winner.username,
                'elo_player1': game.elo_after_player1 - game.elo_before_player1,
                'elo_player2': game.elo_after_player2 - game.elo_before_player1,
            }
            matches.append(match_data)
        user_data = {
            'playerId': player.id,
            'visited': False,
            'username': player.username,
            'mail': player.mail,
            'friends_count': 10,
            'eloPong': player.eloPong,
            'eloConnect4': player.eloConnect4,
            'avatar_url': player.img,
            'is42': is42,
            'matches': matches
        }
        if request.htmx:
            return render(request, 'profil/profil_view.html', {'user_data': user_data}, {'playerId':  player.id})
        return render(request, 'profil/profil_view_full.html', {'user_data': user_data}, {'playerId':  player.id})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required
def visited_profil_view(request, username):
    try:
        player = Player.objects.get(username=username)
        is42 = True
        if (player.img.name.startswith("profile_pics/")):
            is42 = False
        games = (Game.objects.filter(player1=player, finish=True, type="pong") | Game.objects.filter(player2=player, finish=True, type="pong"))
        games = games.order_by('-created_at')
        matches = []
        for game in games:
            game.player1.img.name = '/media/' + game.player1.img.name if game.player1.img.name.startswith("profile_pics/") else game.player1.img.name
            game.player2.img.name = '/media/' + game.player2.img.name if game.player2.img.name.startswith("profile_pics/") else game.player2.img.name
            total_seconds = game.time
            minutes, seconds = divmod(total_seconds, 60)
            match_data = {
                'player1_username': game.player1.username,
                'player2_username': game.player2.username,
                'p1_img': game.player1.img.name,
                'p2_img': game.player2.img.name,
                'time_minutes': minutes,
                'time_seconds': seconds,
                'winner_username': game.winner.username,
                'elo_player1': game.elo_after_player1 - game.elo_before_player1,
                'elo_player2': game.elo_after_player2 - game.elo_before_player1,
            }
            matches.append(match_data)
        user_data = {
            'playerId': player.id,
            'visited': False,
            'username': player.username,
            'mail': player.mail,
            'friends_count': 10,
            'eloPong': player.eloPong,
            'eloConnect4': player.eloConnect4,
            'avatar_url': player.img,
            'is42': is42,
            'matches': matches
        }
        if request.htmx:
            return render(request, 'profil/profil_view.html', {'user_data': user_data})
        return render(request, 'profil/profil_view_full.html', {'user_data': user_data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@login_required
def progressPong_view(request):
    user = request.GET.get('user', 'default_value')
    if request.htmx:
        return render(request, 'progress/progress.html', {'type': 'pong'})
    return render(request, 'progress/progress_full.html', {'type': 'pong'})

@login_required
def progressConnect4_view(request):
    user = request.GET.get('user', 'default_value')
    if request.htmx:
        return render(request, 'progress/progress.html', {'type': 'connect4'})
    return render(request, 'progress/progress_full.html', {'type': 'connect4'})
