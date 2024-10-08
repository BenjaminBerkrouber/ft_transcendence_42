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


from django.http import HttpResponse, JsonResponse
from django.core import serializers


# ______________________________ Include Utils _____________________________________


from itertools import chain
from django.db.models import Q


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

