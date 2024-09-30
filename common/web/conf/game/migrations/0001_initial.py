# Generated by Django 5.1.1 on 2024-09-30 22:07

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='AIPlayer',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('elo', models.PositiveIntegerField(default=1000)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='PongCustomGame',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('custom_ball', models.JSONField(blank=True, null=True)),
                ('custom_plateau', models.JSONField(blank=True, null=True)),
                ('custom_paddle', models.JSONField(blank=True, null=True)),
                ('custom_map', models.JSONField(blank=True, null=True)),
                ('custom_score', models.JSONField(blank=True, null=True)),
                ('custom_animation', models.JSONField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Lobby',
            fields=[
                ('UUID', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('locked', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(default='Lobby', max_length=255)),
                ('ai_players', models.ManyToManyField(blank=True, related_name='lobbies', to='game.aiplayer')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='owner', to='users.player')),
                ('players', models.ManyToManyField(related_name='lobbies', to='users.player')),
            ],
        ),
        migrations.CreateModel(
            name='Game_Tournament',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('layer', models.IntegerField(default=0)),
                ('ai_players', models.ManyToManyField(related_name='games', to='game.aiplayer')),
                ('next_game', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='previous_game', to='game.game_tournament')),
                ('players', models.ManyToManyField(related_name='games', to='users.player')),
                ('winner_ai', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='won_games', to='game.aiplayer')),
                ('winner_player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='won_games', to='users.player')),
                ('custom_game', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.pongcustomgame')),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('UUID', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('type', models.CharField(max_length=10)),
                ('finish', models.BooleanField(default=False)),
                ('time', models.IntegerField(default=0)),
                ('elo_before_player1', models.IntegerField()),
                ('elo_before_player2', models.IntegerField()),
                ('elo_after_player1', models.IntegerField(null=True)),
                ('elo_after_player2', models.IntegerField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1', to='users.player')),
                ('player2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player2', to='users.player')),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='winner', to='users.player')),
                ('custom_game', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.pongcustomgame')),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('UUID', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('UUID_LOBBY', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lobby', to='game.lobby')),
                ('games', models.ManyToManyField(related_name='tournament', to='game.game_tournament')),
            ],
        ),
        migrations.AddField(
            model_name='game_tournament',
            name='UUID_TOURNAMENT',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament', to='game.tournament'),
        ),
    ]
