# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================


# _____________________________________ Django Imports _____________________________________


from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.conf import settings


# ======================================================================================================================
# =================================================== Decorator  =======================================================
# ======================================================================================================================


def login_required(view_func):
    """
    Decorator that checks if a user is authenticated before allowing access
    to a view. If the user is not authenticated, they will be redirected
    to the login page.

    Args:
        view_func: The view function to be wrapped.

    Returns:
        Wrapped view function that checks authentication.
    """
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(settings.LOGIN_URL)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def not_login_required(view_func):
    """
    Decorator that checks if a user is not authenticated before allowing
    access to a view. If the user is already authenticated, they will be
    redirected to the profile page.

    Args:
        view_func: The view function to be wrapped.

    Returns:
        Wrapped view function that checks if the user is not authenticated.
    """
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('/profil/')
        return view_func(request, *args, **kwargs)
    return _wrapped_view
