from typing import Any
from django.db import models
import uuid

class PongCustomGame(models.Model):
    id = models.AutoField(primary_key=True)
    custom_ball = models.JSONField(null=True, blank=True)
    custom_plateau = models.JSONField(null=True, blank=True)
    custom_paddle = models.JSONField(null=True, blank=True)
    custom_map = models.JSONField(null=True, blank=True)
    custom_score = models.JSONField(null=True, blank=True)
    custom_animation = models.JSONField(null=True, blank=True)



class Game(models.Model):
    UUID = models.UUIDField(default=uuid.uuid4, primary_key=True, unique=True, editable=False)
    type = models.CharField(max_length=10)
    finish = models.BooleanField(default=False)
    time = models.IntegerField(default=0)
    winner_id = models.IntegerField(null=True, blank=True)
    custom_game = models.ForeignKey(PongCustomGame, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PlayerGame(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='players')
    player_id = models.IntegerField()
    elo_before = models.IntegerField()
    elo_after = models.IntegerField(null=True, blank=True)




class AIPlayer(models.Model):
    id = models.AutoField(primary_key=True)
    elo = models.PositiveIntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)

class Lobby(models.Model):
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner_id = models.IntegerField(null=True, blank=True)
    players_ids = models.JSONField(default=list)
    ai_players = models.ManyToManyField('AIPlayer', related_name='lobbies', blank=True)
    locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, unique=False, null=False, default='Lobby')

    def lock(self):
        self.locked = True
        self.save()

class Tournament(models.Model):
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    UUID_LOBBY = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name='lobby')
    created_at = models.DateTimeField(auto_now_add=True)
    games = models.ManyToManyField('Game_Tournament', related_name='tournament')

class Game_Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    UUID_TOURNAMENT = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament')
    players_ids = models.JSONField(default=list)
    ai_players = models.ManyToManyField(AIPlayer, related_name='games')
    winner_player_id = models.IntegerField(null=True, blank=True)
    winner_ai = models.ForeignKey(AIPlayer, on_delete=models.CASCADE, related_name='won_games', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    next_game = models.ForeignKey('Game_Tournament', on_delete=models.CASCADE, related_name='previous_game', null=True, blank=True)
    layer = models.IntegerField(default=0)
    custom_game = models.ForeignKey(PongCustomGame, on_delete=models.SET_NULL, null=True, blank=True)
