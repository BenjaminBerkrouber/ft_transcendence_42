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
from api.models import Player, Game
from django.core import serializers
from api.login_required import login_required, not_login_required
from django.contrib.auth import logout
import logging

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
        data = Player.objects.get(username=request.user)
        is42 = True
        if (data.img.name.startswith("profile_pics/")):
            is42 = False
        user = request.user
        player = Player.objects.get(username=user)
        games = (Game.objects.filter(player1=player, finish=True, type="pong") | Game.objects.filter(player2=player, finish=True, type="pong"))
        games = games.order_by('-created_at')

        matches = []
        for game in games:
            logger.info(game.type)
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
            'visited': False,
            'username': data.username,
            'mail': data.mail,
            'friends_count': 10,
            'eloPong': data.eloPong,
            'eloConnect4': data.eloConnect4,
            'avatar_url': data.img,
            'is42': is42,
            'matches': matches
        }
        if request.htmx:
            return render(request, 'profil/profil_view.html', {'user_data': user_data})
        return render(request, 'profil/profil_view_full.html', {'user_data': user_data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required
def visited_profil_view(request, username):
    try:
        data = Player.objects.get(username=username)
        is42 = True
        if (data.img.name.startswith("profile_pics")):
            is42 = False
        user_data = {
            'visited': True,
            'username': data.username,
            'mail': data.mail,
            'friends_count': 10,
            'eloPong': data.eloPong,
            'eloConnect4': data.eloConnect4,
            'avatar_url': data.img,
            'is42': is42,
            'matches': []
        }
        games = Game.objects.filter(player1=data) | Game.objects.filter(player2=data)
        games = games.order_by('-created_at')
        for game in games:
            match_data = {
                'player1': game.player1,
                'player2': game.player2,
                'time': game.time,
                'winner': game.winner,
                'elo_before_player1': game.elo_before_player1,
                'elo_before_player2': game.elo_before_player2,
                'elo_after_player1': game.elo_after_player1,
                'elo_after_player': game.elo_after_player2
            }
            user_data['matches'].append(match_data)
        if request.htmx:
            return render(request, 'profil/profil_view.html', {'user_data': user_data})
        return render(request, 'profil/profil_view_full.html', {'user_data': user_data})
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@login_required
def visited_progress_view(request, username):
    if request.htmx:
        return render(request, 'progress/progress.html', {'username': username})
    return render(request, 'progress/progress_full.html', {'username': username})

@login_required
def progressPong_view(request):
    if request.htmx:
        return render(request, 'progress/progress.html', {'type': 'pong'})
    return render(request, 'progress/progress_full.html', {'type': 'pong'})

@login_required
def progressConnect4_view(request):
    if request.htmx:
        return render(request, 'progress/progress.html', {'type': 'connect4'})
    return render(request, 'progress/progress_full.html', {'type': 'connect4'})
