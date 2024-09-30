from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.conf import settings

# ======================== Decorateur Validator ============================

def login_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(settings.LOGIN_URL)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def not_login_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('/profil/')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# =============================================================================