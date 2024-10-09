from django.contrib import admin
from django.urls import path, include, re_path
from . import views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from game import consumers as game_consumers


urlpatterns = [
    path('', views.index, name='index'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('game/', include('game.urls')),
]

urlpatterns += [
    path('', include('users.urls')),
]

urlpatterns += [
    path('', include('leaderboard.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'transcendence.views.custom_404_view'