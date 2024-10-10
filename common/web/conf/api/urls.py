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
    path('getHashRoom/', views.getHashRoom),
]

# Add URLS for users
urlpatterns += [
	path('@me/', views_users.get_me),
    path('getUserById/', views_users.getUserById),
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
    path('getPlayerById/', views_users.getPlayerById, name='getPlayerById'),
    path('getPlayersByIds/', views_users.getPlayersByIds, name='getPlayersByIds'),
    path('getPlayerByUsername/', views_users.getPlayerByUserName),
    path('getAllPlayerDataExcludeIds/', views_users.getAllPlayerDataExcludeIds, name='getAllPlayerDataExcludeIds'),
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
    path('clearNotifSocial/', views_chat.clearNotifSocial, name='clearNotifSocial'),
    path('clearNotifChatForUser/', views_chat.clearNotifChatForUser),
]

# Add URLS for game
urlpatterns += [
    path('getDataGamesPlayers/', views_game.getDataGamesPlayers, name='getDataGamesPlayers'),
    path('removeGameByUUID/', views_game.removeGameByUUID, name='removeGameByUUID'),
    path('createGame/', views_game.createGame, name='createGame'),
    path('getAllLobby/', views_game.getAllLobby),
    path('getGameUUID/', views_game.getGameUUID),
    path('getGameData/', views_game.getGameData),


    # path('getNumberOfGames/', views_game.getNumberOfGames),
    # path('getMaxElo/', views_game.getMaxElo),
    # path('getAvgGameTime/', views_game.getAvgGameTime),
    # path('getMaxWinStreak/', views_game.getMaxWinStreak),
    # path('getWinrate/', views_game.getWinrate),
    # path('lastGameIsWin/', views_game.lastGameIsWin),
    # path('getPlayerGameData/', views_game.getPlayerGameData),
    # path('getMatches/', views_game.getMatches),

    # path('createLobby/', views_game.createLobby),
    # path('addPlayerToLobby/', views_game.addPlayerToLobby),
    # path('getUserAvailableToLobby/', views_game.getUserAvailableToLobby),
    # path('addIaToLobby/', views_game.addIaToLobby),
    # path('lockLobby/', views_game.lockLobby),
    # path('getTournamentInfo/', views_game.getTournamentInfo),
    # path('setWinnerAtTournamentGame/', views_game.setWinnerAtTournamentGame),
    # path('finishGameOnlyIa/', views_game.finishGameOnlyIa),
    # path('getLobbyIsLocked/', views_game.getLobbyIsLocked),
    # path('removeLobby/', views_game.removeLobby),
    # path('getConnect4GameForUser/', views_game.getConnect4GameForUser),
    # path('getPongGameForUser/', views_game.getPongGameForUser),
    # path('setPongCustomGame/', views_game.setPongCustomGame),
    # path('getPongCustomData/', views_game.getPongCustomData),
    # path('setSessionPongCustomGame/', views_game.setSessionPongCustomGame),

    # path('getSessionPongCustomGame/', views_game.getSessionPongCustomGame),

]

