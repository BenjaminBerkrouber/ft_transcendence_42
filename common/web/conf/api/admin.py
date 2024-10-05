from django.contrib import admin

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player, Friends
from chat.models import Messages, GameInvitation, Notification

# Register your models here.
admin.site.register(Player)
admin.site.register(Friends)
admin.site.register(Messages)
admin.site.register(Game)
admin.site.register(GameInvitation)
admin.site.register(Notification)
admin.site.register(AIPlayer)
admin.site.register(Tournament)
admin.site.register(Game_Tournament)
