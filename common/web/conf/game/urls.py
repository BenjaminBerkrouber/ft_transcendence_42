from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('', views.gameHome),
    path('pong/local/', views.pongLocal),
	path('pong/pongRanked/', views.pongRanked),
    path('pong/tournament/', views.pongTournament),
    # path('pong/tournament/lobby/', views.pongTournamentLobby),
    # path('pong/tournament/game/', views.pongTournamentGame),
	path('pong/pongIa/', views.pongIa),
    path('pong/custom/', views.pongCustom),
	path('pong/privGame/', views.pongPrivGame),
	
    # # view valide
    # path('pong3D/', views.pong3D),
]