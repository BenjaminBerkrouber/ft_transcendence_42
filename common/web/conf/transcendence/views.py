# transcendence/views.py
from django.shortcuts import redirect
from django.conf import settings
from django.urls import reverse
from django.shortcuts import render

def custom_404_view(request, exception):
    return render(request, 'global_templates/404.html', {}, status=404)

def index(request):
    if request.user.is_authenticated:
        context = {
            'no_footer': False,
        }
    else:
        context = {
            'no_footer': True,
        }
    if request.htmx:
        return render(request, 'homePage.html', context)
    return render(request, 'homePage_full.html', context)