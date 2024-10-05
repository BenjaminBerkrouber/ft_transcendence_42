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
    player = Player.objects.get(username=request.user)
    if (player.img.name.startswith("profile_pics")):
        img = player.img.url
    else:
        img = player.img.name
    return JsonResponse({'id': player.id, 'username': player.username,
                        'mail': player.mail, 'img': img, 'eloPong': player.eloPong, 'eloConnect4': player.eloConnect4})

@api_view(['GET'])
@login_required
def getUserById(request):
    try:
        userId = request.GET.get('userId')
        player = Player.objects.get(id=userId)
        player = {
            "id": player.id,
            "username": player.username,
            "img": str(player.img)
        }        
        return Response(player, status=200)
    except Player.DoesNotExist:
        return Response({"error": f"Player with id {userId} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ======================================================================================================================
# ================================================ Social Methode  =====================================================
# ======================================================================================================================

@csrf_exempt
@api_view(['GET'])
@login_required
def getHashRoom(request):
    try:
        roomName = request.GET.get('roomName')
        hash_value = 0
        for char in roomName:
            hash_value = (hash_value * 31 + ord(char)) % (2**32)
        return Response({"roomName": hash_value}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

