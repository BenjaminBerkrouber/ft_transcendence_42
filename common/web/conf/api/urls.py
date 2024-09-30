# api/urls.py
from django.urls import path
from . import views
from . import views_users
from . import views_chat
from . import views_game
from django.conf import settings

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

from django.contrib.auth import views as auth_views

# Add URLS for API
urlpatterns = [
    path('', views.getData),
	path('@me/', views.get_me),
    path('getAllUsers/', views.getAllUsers),
]

# Add URLS for users
urlpatterns += [
    path('register-42/', views_users.register_42),
    path('login_player/', views_users.login_player, name='login_player'),
    path('register_player/', views_users.register_player, name='register_player'),
    path('logout/', views_users.logout, name='logout'),
    path('updateImg/', views_users.update_img, name='update_img'),
    path('updateData/', views_users.update_data, name='update_data'),
    path('updatePassword/', views_users.updatePassword, name='updatePassword'),
    path('getNumberOfGames/', views_users.getNumberOfGames),
    path('getCurrentElo/', views_users.getCurrentElo),
    path('getMaxElo/', views_users.getMaxElo),
    path('getAvgGameTime/', views_users.getAvgGameTime),
    path('getMaxWinStreak/', views_users.getMaxWinStreak),
    path('getWinrate/', views_users.getWinrate),
    path('lastGameIsWin/', views_users.lastGameIsWin),
    path('getPlayerGameData/', views_users.getPlayerGameData),
    path('getMatches/', views_users.getMatches),
    path('lastConnexion/', views_users.lastConnexion),
]

# Add URLS for chat
urlpatterns += [
    path('getSocialUser/', views_chat.getSocialUser),
    path('getChatUser/', views_chat.getChatUser),
    path('getMessages/', views_chat.getMessages),
    path('sendMessage/', views_chat.sendMessage),
    path('sendInvite/', views_chat.sendInvite),
    path('isOnline/', views_chat.isOnline),
    path('updateSocialStatus/', views_chat.updateSocialStatus),
    path('getHashRoom/', views_chat.getHashRoom),
    path('getGlobalNotif/', views_chat.getGlobalNotif),
    path('removeChatNotif/', views_chat.removeChatNotif),
    path('getNbrSocialNotif/', views_chat.getNbrSocialNotif),
    path('getNbrChatNotif/', views_chat.getNbrChatNotif),
    path('updateInviteStatus/', views_chat.updateInviteStatus),
    path('clearNotifSocial/', views_chat.clearNotifSocial),
    path('clearNotifChatForUser/', views_chat.clearNotifChatForUser),
]

# Add URLS for game
urlpatterns += [
    path('getHistoryGame/', views_game.getHistoryGame),
    path('createLobby/', views_game.createLobby),
    path('getAllLobby/', views_game.getAllLobby),
    path('getUserById/', views_game.getUserById),
    path('addPlayerToLobby/', views_game.addPlayerToLobby),
    path('getUserAvailableToLobby/', views_game.getUserAvailableToLobby),
    path('addIaToLobby/', views_game.addIaToLobby),
    path('lockLobby/', views_game.lockLobby),
    path('getTournamentInfo/', views_game.getTournamentInfo),
    path('getConnect4GameForUser/', views_game.getConnect4GameForUser),
    path('getPongGameForUser/', views_game.getPongGameForUser),
    path('setWinnerAtTournamentGame/', views_game.setWinnerAtTournamentGame),
    path('finishGameOnlyIa/', views_game.finishGameOnlyIa),
    path('getLobbyIsLocked/', views_game.getLobbyIsLocked),
    path('removeLobby/', views_game.removeLobby),
    path('setPongCustomGame/', views_game.setPongCustomGame),
    path('getPongCustomData/', views_game.getPongCustomData),
    path('setSessionPongCustomGame/', views_game.setSessionPongCustomGame),

    path('getSessionPongCustomGame/', views_game.getSessionPongCustomGame),

]

