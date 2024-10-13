# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


# _____________________________________ Standard Imports _____________________________________


import uuid

# _____________________________________ Django Imports _____________________________________


from typing import Any
from django.db import models


# ======================================================================================================================
# ==================================================== Models  =========================================================
# ======================================================================================================================


# _____________________________________ PongCustomGame _____________________________________


class PongCustomGame(models.Model):
    """
    PongCustomGame model representing custom game settings for a Pong game.

    Attributes:
        id (AutoField): Unique identifier for the custom game settings.
        custom_ball (JSONField): JSON field storing custom settings for the ball.
        custom_plateau (JSONField): JSON field storing custom settings for the game plateau.
        custom_paddle (JSONField): JSON field storing custom settings for the paddles.
        custom_map (JSONField): JSON field storing custom settings for the game map.
        custom_score (JSONField): JSON field storing custom settings for the game score.
        custom_animation (JSONField): JSON field storing custom animation settings.
    """
    id = models.AutoField(primary_key=True)
    custom_ball = models.JSONField(null=True, blank=True)
    custom_plateau = models.JSONField(null=True, blank=True)
    custom_paddle = models.JSONField(null=True, blank=True)
    custom_map = models.JSONField(null=True, blank=True)
    custom_score = models.JSONField(null=True, blank=True)
    custom_animation = models.JSONField(null=True, blank=True)


# _____________________________________ Game _____________________________________


class Game(models.Model):
    """
    Game model representing an individual game session.

    Attributes:
        UUID (UUIDField): Unique identifier for the game.
        type (CharField): Type of the game (e.g., Pong, Connect4), max length of 10 characters.
        finish (BooleanField): Boolean flag indicating whether the game is finished.
        time (IntegerField): Duration of the game in seconds.
        winner_id (IntegerField): ID of the player who won the game.
        custom_game (ForeignKey): Reference to the custom settings used in the game (PongCustomGame model).
        created_at (DateTimeField): Timestamp of when the game was created.
    """
    UUID = models.UUIDField(default=uuid.uuid4, primary_key=True, unique=True, editable=False)
    type = models.CharField(max_length=10)
    finish = models.BooleanField(default=False)
    time = models.IntegerField(default=0)
    winner_id = models.IntegerField(null=True, blank=True)
    custom_game = models.ForeignKey(PongCustomGame, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# _____________________________________ PlayerGame _____________________________________


class PlayerGame(models.Model):
    """
    PlayerGame model representing the relationship between players and a game session.

    Attributes:
        game (ForeignKey): Reference to the game instance.
        player_id (IntegerField): ID of the player participating in the game.
        elo_before (IntegerField): Elo rating of the player before the game.
        elo_after (IntegerField): Elo rating of the player after the game (nullable).
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='players')
    player_id = models.IntegerField()
    elo_before = models.IntegerField()
    elo_after = models.IntegerField(null=True, blank=True)


# _____________________________________ AIPlayer _____________________________________


class AIPlayer(models.Model):
    """
    AIPlayer model representing an AI-controlled player.

    Attributes:
        id (AutoField): Unique identifier for the AI player.
        elo (PositiveIntegerField): Elo rating for the AI player, defaults to 1000.
        created_at (DateTimeField): Timestamp of when the AI player was created.
    """
    id = models.AutoField(primary_key=True)
    elo = models.PositiveIntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)


# _____________________________________ Lobby _____________________________________


class Lobby(models.Model):
    """
    Lobby model representing a game lobby where players can gather.

    Attributes:
        UUID (UUIDField): Unique identifier for the lobby.
        owner_id (IntegerField): ID of the lobby owner.
        players_ids (JSONField): List of player IDs in the lobby.
        ai_players (ManyToManyField): AI players associated with the lobby.
        locked (BooleanField): Boolean flag indicating if the lobby is locked.
        created_at (DateTimeField): Timestamp of when the lobby was created.
        name (CharField): Name of the lobby, default is 'Lobby'.
    """
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=False, null=False, default='Lobby')
    locked = models.BooleanField(default=False)
    owner_id = models.IntegerField(null=True, blank=True)
    players_ids = models.JSONField(default=list)
    ai_players = models.ManyToManyField('AIPlayer', related_name='lobbies', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# _____________________________________ Tournament _____________________________________


class Tournament(models.Model):
    """
    Tournament model representing a series of games played within a tournament structure.

    Attributes:
        UUID (UUIDField): Unique identifier for the tournament.
        UUID_LOBBY (ForeignKey): Reference to the associated lobby.
        created_at (DateTimeField): Timestamp of when the tournament was created.
        games (ManyToManyField): Collection of games played in the tournament.
    """
    UUID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    UUID_LOBBY = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name='lobby')
    created_at = models.DateTimeField(auto_now_add=True)
    games = models.ManyToManyField('Game_Tournament', related_name='tournament')


# _____________________________________ Game_Tournament _____________________________________


class Game_Tournament(models.Model):
    """
    Game_Tournament model representing an individual game within a tournament.

    Attributes:
        id (AutoField): Unique identifier for the game.
        UUID_TOURNAMENT (ForeignKey): Reference to the associated tournament.
        players_ids (JSONField): List of player IDs participating in the game.
        ai_players (ManyToManyField): AI players associated with the game.
        winner_player_id (IntegerField): ID of the player who won the game (nullable).
        winner_ai (ForeignKey): Reference to the AI player who won the game (nullable).
        created_at (DateTimeField): Timestamp of when the game was created.
        next_game (ForeignKey): Reference to the next game in the tournament (nullable).
        layer (IntegerField): Tournament layer or level for this game.
        custom_game (ForeignKey): Reference to custom settings used for the game (PongCustomGame).
    """
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
