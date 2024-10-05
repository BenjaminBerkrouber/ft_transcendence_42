# api/urls.py
from django.urls import path
from . import views
from . import views_users
from . import views_chat
from . import views_game
from django.conf import settings

from django.contrib.auth import views as auth_views

# Add URLS for API
urlpatterns = [
    path('', views.getData),
	path('@me/', views.get_me),
    path('getHashRoom/', views.getHashRoom),
    path('getUserById/', views.getUserById),
]

# Add URLS for users
urlpatterns += [
    path('register-42/', views_users.register_42),
    path('loginPlayer/', views_users.loginPlayer, name='loginPlayer'),
    path('register_player/', views_users.register_player, name='register_player'),
    path('logout/', views_users.logout, name='logout'),
    path('updateProfilPicsPlayer/', views_users.updateProfilPicsPlayer, name='updateProfilPicsPlayer'),
    path('updateDataPlayer/', views_users.updateDataPlayer, name='updateDataPlayer'),
    path('updatePassword/', views_users.updatePassword, name='updatePassword'),
    path('getCurrentElo/', views_users.getCurrentElo),
    path('lastConnexion/', views_users.lastConnexion),
    path('getPlayer/', views_users.getPlayer),
    path('getPlayerById/', views_users.getPlayerById),
    path('getPlayerByUsername/', views_users.getPlayerByUserName),
    path('getDataGamesPlayers/', views_users.getDataGamesPlayers),

    path('players/<int:player_id>/', views_users.get_player_details, name='get_player_details'),
]

# Add URLS for chat
urlpatterns += [
    path('getSocialUser/', views_chat.getSocialUser),
    path('getChatUser/', views_chat.getChatUser),
    path('getMessages/', views_chat.getMessages),
    path('sendMessage/', views_chat.sendMessage),
    path('sendGameInvite/', views_chat.sendGameInvite),
    path('updateSocialStatus/', views_chat.updateSocialStatus),
    path('getGlobalNotif/', views_chat.getGlobalNotif),
    path('getNbrSocialNotif/', views_chat.getNbrSocialNotif),
    path('getNbrChatNotif/', views_chat.getNbrChatNotif),
    path('updateGameInviteStatus/', views_chat.updateGameInviteStatus),
    path('clearNotifSocial/', views_chat.clearNotifSocial),
    path('clearNotifChatForUser/', views_chat.clearNotifChatForUser),
]

# Add URLS for game
urlpatterns += [
    path('getNumberOfGames/', views_game.getNumberOfGames),
    path('getMaxElo/', views_game.getMaxElo),
    path('getAvgGameTime/', views_game.getAvgGameTime),
    path('getMaxWinStreak/', views_game.getMaxWinStreak),
    path('getWinrate/', views_game.getWinrate),
    path('lastGameIsWin/', views_game.lastGameIsWin),
    path('getPlayerGameData/', views_game.getPlayerGameData),
    path('getMatches/', views_game.getMatches),

    path('createLobby/', views_game.createLobby),
    path('getAllLobby/', views_game.getAllLobby),
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

