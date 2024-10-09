from django.db import models
import uuid

class Messages(models.Model):
    id = models.AutoField(primary_key=True)
    sender_id = models.IntegerField()
    receiver_id = models.IntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class GameInvitation(models.Model):
    id = models.AutoField(primary_key=True)
    gameUUID = models.UUIDField(default=uuid.uuid4, editable=False)
    player1_id = models.IntegerField()
    player2_id = models.IntegerField()
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    sender_id = models.IntegerField()
    type = models.IntegerField()
    recipient_id = models.IntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Friends(models.Model):
    id = models.AutoField(primary_key=True)
    player_id = models.IntegerField()
    friend_id = models.IntegerField()
    status = models.IntegerField(default=0)