from django.db import models

from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    mail = models.CharField(max_length=255, unique=True)
    img = models.ImageField(default='profile_pics/default.png', upload_to='profile_pics/')
    created_at = models.DateTimeField(auto_now_add=True)
    eloPong = models.PositiveIntegerField(default=1000)
    eloConnect4 = models.PositiveIntegerField(default=1000)
    is_online = models.BooleanField(default=False)
    lastConnexion = models.DateTimeField(default=None, null=True, blank=True)

    def __str__(self):
        return f"Player(id={self.id}, username={self.username}, eloPong={self.eloPong}, eloConnect4={self.eloConnect4})"