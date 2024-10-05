# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('profil/', views.profil, name='profil'),
    path('progress/', views.progress, name='progress'),
]
