from django.urls import re_path
from . import consumers


websocket_urlpatterns = [
	re_path(r'^ws/game/pong/(?P<game_id>[0-9a-f-]+)/$', consumers.GameConsumer.as_asgi()),
    # re_path(r'ws/lobby/(?P<room_name>\w+)/$', consumers.LobbyConsumer.as_asgi()),
    # re_path(r'ws/notif/(?P<room_name>\w+)/$', consumers.NotifConsumer.as_asgi()),
]