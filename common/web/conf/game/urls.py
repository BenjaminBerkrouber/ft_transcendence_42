from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('', views.gameHome),
    path('pong3D/', views.pong3D),
	
    # # view valide
	# path('pong/', views.pongPrivGame),
    # path('pong/local/', views.pongLocal),
    # path('pong/custom/', views.pongCustom),
    # path('pong/tournament/', views.pongTournament),
    # path('pong/tournament/lobby/', views.pongTournamentLobby),
    # path('pong/tournament/game/', views.pongTournamentGame),
]