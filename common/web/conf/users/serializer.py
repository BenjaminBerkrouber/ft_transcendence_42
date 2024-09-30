from rest_framework import serializers

from game.models import Game, Lobby, Game_Tournament, Tournament, PongCustomGame, AIPlayer
from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification

from django.core.serializers.json import DjangoJSONEncoder

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'username', 'mail', 'img', 'created_at', 'eloPong', 'eloConnect4', 'is_online', 'lastConnexion']