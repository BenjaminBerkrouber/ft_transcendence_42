
import time
from django.shortcuts import render, redirect
from django.conf import settings


# ======================== Decorateur Validator ============================


# =============================================================================

# def leaderboard(request):
#     allPlayerPong = Player.objects.all().order_by('eloPong').values().reverse()[:10]
#     allPlayerConnect4 = Player.objects.all().order_by('eloConnect4').values().reverse()[:10]
#     for player in allPlayerPong:
#         if not 'http' in player['img']:
#             player['img'] = settings.MEDIA_URL + player['img']
#     for player in allPlayerConnect4:
#         if not 'http' in player['img']:
#             player['img'] = settings.MEDIA_URL + player['img']
#     context = {
#         'leaderboardPong': allPlayerPong,
#         'leaderboardConnect4': allPlayerConnect4,
#     }
#     if (request.htmx):
#         return render(request, 'leaderboard/leaderboard.html', context)
#     return render(request, 'leaderboard/leaderboard_full.html', context)
