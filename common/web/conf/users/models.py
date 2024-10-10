# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


# _____________________________________ Django Imports _____________________________________


from django.db import models


# ======================================================================================================================
# ============================================= Models for User Management  ============================================
# ======================================================================================================================


# _____________________________________ Player _____________________________________


class Player(models.Model):
    """
    Player model representing a user in the gaming application.

    Attributes:
        id (AutoField): Unique identifier for the player.
        username (CharField): Unique username for the player, with a max length of 255.
        mail (CharField): Unique email address for the player, with a max length of 255.
        img (ImageField): Profile image for the player, defaults to a placeholder image.
        created_at (DateTimeField): Timestamp when the player account was created.
        eloPong (PositiveIntegerField): Elo rating for the Pong game, defaults to 1000.
        eloConnect4 (PositiveIntegerField): Elo rating for the Connect 4 game, defaults to 1000.
        is_online (BooleanField): Status indicating if the player is currently online.
        lastConnexion (DateTimeField): Timestamp of the player's last connection.
    """
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

