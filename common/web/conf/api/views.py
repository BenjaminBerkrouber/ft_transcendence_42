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
from django.http import HttpResponse, JsonResponse
from django.core import serializers

# ______________________________ Include Utils _____________________________________

from itertools import chain
from django.db.models import Q


# ========================================================================================================
# ============================================= Methode  =================================================
# ========================================================================================================


@login_required
@api_view(['GET'])
def getData(request):
    return Response("")

@login_required
@api_view(['GET'])
def get_me(request):
    user = request.user
    player = Player.objects.get(username=user)
    if (player.img.name.startswith("profile_pics")):
        img = player.img.url
    else:
        img = player.img.name
    return JsonResponse({'id': player.id, 'username': player.username,
                        'mail': player.mail, 'img': img, 'eloPong': player.eloPong, 'eloConnect4': player.eloConnect4})

@login_required
@api_view(['GET'])
def getAllUsers(request):
    u = serializers.serialize('json', Player.objects.all(), fields=('username', 'img'))
    return HttpResponse(u, content_type='application/json')
