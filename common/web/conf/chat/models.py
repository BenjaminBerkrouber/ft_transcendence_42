from typing import Any
from django.db import models
from django.contrib.auth.models import User
import requests
from django.core.exceptions import ValidationError

from users.models import Player
from game.models import Game

class Friends(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player')
    friend = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friend')
    status = models.IntegerField(default=0)

class Messages(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='receiver')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class GameInvitation(models.Model):
    id = models.AutoField(primary_key=True)
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game')
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_invitations')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_invitations')
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='notif_sender')
    type = models.IntegerField()
    recipient = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='notif_recipient')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)