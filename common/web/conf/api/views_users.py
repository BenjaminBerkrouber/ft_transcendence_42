# ========================================================================================================
# ============================================= Include  =================================================
# ========================================================================================================


# _____________________________________ Standard Library Imports _____________________________________


import os
import re


# _____________________________________ Django Imports _____________________________________


from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.core import files
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt


# _____________________________________ Third-Party Imports _____________________________________


from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response


# _____________________________________ Local Application Imports _____________________________________


from users.models import Player, Friends
from users.login_required import login_required, not_login_required


# ======================================================================================================================
# ================================================= Login METHODE  =====================================================
# ======================================================================================================================


# _____________________________________ Login User _____________________________________


@csrf_exempt
@api_view(['POST'])
@not_login_required
def loginPlayer(request):
    """
        Authenticates a player using their email and password, and logs them in if valid.
        Args:
            request (HttpRequest): The HTTP request object containing email and password.
        Returns:
            JsonResponse: A response object containing:
                - success (bool): Indicates if the login was successful.
                - redirect_url (str): URL to redirect to if login is successful.
                - error (str): Error message if login fails due to invalid credentials.
        Raises:
            Player.DoesNotExist: If no Player with the provided email exists.
    """
    mail = request.POST.get("email")
    password = request.POST.get("pass")
    try:
        if not mail or not password:
            return (JsonResponse({'success': False, 'error': 'Invalid email or password, please try again'}))
        if not _is_valid_email(mail) :
            return (JsonResponse({'success': False, 'error': 'Invalid email or password, please try againssas'}))
        player = Player.objects.get(mail=mail)
        user = authenticate(request, username=player.username, password=password)
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            response = JsonResponse({'success': True, 'redirect_url': '/profil/'})
            response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)
            return (response)
        else:
            return (JsonResponse({'success': False, 'error': 'Invalid email or password, please try again'}))
    except Player.DoesNotExist:
        return (JsonResponse({'success': False, 'error': 'Invalid email or password, please try again'}))


# _____________________________________ Register User _____________________________________


@csrf_exempt
@api_view(['POST'])
@not_login_required
def register_player(request):
    """
        Registers a new player and logs them in if successful.
        Args:
            request (HttpRequest): The HTTP request object containing registration details.
        Returns:
            JsonResponse: A response indicating success or failure with relevant messages.
    """
    username = request.POST.get("username")
    email = request.POST.get("email")
    password = request.POST.get("pass")
    validation_error = _validate_registration(username, email, password)
    if validation_error:
        return (JsonResponse({'success': False, 'error': validation_error}))
    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        Player.objects.create(username=username, mail=email)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            response = JsonResponse({'success': True, 'redirect_url': '/profil/'})
            response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)
            return (response)
        else:
            return (JsonResponse({'success': False, 'error': 'Authentication failed'}))
    except Exception as e:
        return (JsonResponse({'success': False, 'error': str(e)}))

def _validate_registration(username, email, password):
    """
        Validates registration data.
        Args:
            username (str): The desired username.
            email (str): The user's email address.
            password (str): The desired password.
            
        Returns:
            str: An error message if validation fails, or None if validation succeeds.
    """
    try:
        if (
            User.objects.filter(email=email).exists() or 
            User.objects.filter(username=username).exists() or 
            Player.objects.filter(mail=email).exists() or 
            Player.objects.filter(username=username).exists() or 
            not _is_valid_email(email) or 
            not _is_valid_password(password) or 
            not _is_valid_username(username)
        ):
            return ("Invalid credentials")
        return (None)
    except ValidationError:
        return ("Invalid credentials")

def _is_valid_email(email):
    """
        Validates if the provided email is valid.
        Args:
            email (str): The email string to validate.
        Returns:
            bool: True if the email is valid, False otherwise.
    """
    try:
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return (re.match(pattern, email) is not None)
    except ValidationError:
        return False

def _is_valid_password(password):
    """
        Validates if the provided password meets the defined strength criteria.
        The password must contain at least 8 characters, with at least one uppercase letter, 
        one lowercase letter, and one digit.
        Args:
            password (str): The password string to validate.
        Returns:
            bool: True if the password meets the validation criteria, False otherwise.
    """
    try :
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$'
        return (re.match(pattern, password) is not None)
    except ValidationError:
        return False

def _is_valid_username(username):
    """
        Validates if the provided username is valid.
        Args:
            username (str): The username string to validate.
        Returns:
            bool: True if the username is valid, False otherwise.
    """
    try :
        pattern = r'^[\S]{4,12}$'
        return (re.match(pattern, username) is not None)
    except ValidationError:
        return False


# _____________________________________ Logout User _____________________________________


@csrf_exempt
@login_required
@api_view(['POST'])
def logout(request):
    """
        Logs out the user and invalidates their session.
        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            JsonResponse: A response indicating success or failure.
    """
    auth_logout(request)
    response = redirect('/login/')
    response.set_cookie('userIsAuthenticated', 'false', max_age=7*24*60*60)
    return (response)


# _____________________________________ Login 42Login _____________________________________


@csrf_exempt
@api_view(['GET'])
@not_login_required
def register_42(request, format=None):
    """
        Register a user via the 42 API.
        This function retrieves the access token using the provided authorization code,
        then obtains the user's information and registers it in the database
        or updates the existing user. Finally, it logs in the user and redirects
        to the profile page.
        Args:
            request (HttpRequest): The HTTP request object.
            format (str, optional): The format of the response. Defaults to None.
        Returns:
            HttpResponse: A response redirecting to the profile page
                        with an authentication cookie.
    """
    hostname = request.get_host()
    redirect_uri = f"https://{hostname}:42424/api/register-42/"
    token = _get_access_token(request.query_params["code"], redirect_uri)
    user_info = _get_user_info(token)
    mail = user_info["email"]
    username = user_info["login"]
    password = make_password(token)
    user = _create_or_update_user(mail, username, password, user_info)
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    response = redirect('/profil/')
    response.set_cookie('userIsAuthenticated', 'true', max_age=7*24*60*60)
    return (response)

def _get_access_token(code, redirect_uri):
    """
        Obtain the access token using the authorization code.
        This function sends a POST request to the 42 API to obtain an access token
        using the provided authorization code and redirect URI.
        Args:
            code (str): The authorization code provided by the 42 API.
            redirect_uri (str): The redirect URI that was used to obtain the authorization code.
        Returns:
            str: The access token obtained from the 42 API.
    """
    body = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("client_id"),
        "client_secret": os.getenv("client_secret"),
        "code": code,
        "redirect_uri": redirect_uri
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    return (response.json().get("access_token"))

def _get_user_info(token):
    """
        Retrieve user information from the 42 API using the access token.
        This function sends a GET request to the 42 API to obtain user information
        using the provided access token.
        Args:
            token (str): The access token obtained from the 42 API.
        Returns:
            dict: A dictionary containing user information retrieved from the API.
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
    return (response.json())

def _create_or_update_user(mail, username, password, user_info):
    """
        Create a new user or update an existing user in the database.
        This function attempts to find an existing user by email. If found, it updates
        the user's password. If not found, it creates a new user with the provided information.
        Args:
            mail (str): The user's email address.
            username (str): The user's username.
            password (str): The user's password.
            user_info (dict): A dictionary containing additional user information.
        Returns:
            User: The created or updated user object.
    """
    try:
        user = User.objects.get(email=mail)
        user.set_password(password)
        user.save()
        return (user)
    except User.DoesNotExist:
        user = User.objects.create_user(username=username, email=mail, password=password)
        player = Player.objects.create(username=username, mail=mail, img=user_info.get("image", {}).get("link"))
        return (user)


# ======================================================================================================================
# ============================================= UpdateProfil METHODE  ==================================================
# ======================================================================================================================


# _____________________________________ Update data _____________________________________


@api_view(['POST'])
@csrf_exempt
@login_required
def updateDataPlayer(request):
    """
        Update the player's username and email.
        Args:
            request (HttpRequest): The HTTP request object containing the new username and email.
        Returns:
            JsonResponse: A JSON response indicating success or failure with error messages.
    """
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        user = User.objects.get(username=request.user)
        player = Player.objects.get(username=request.user)
        email_validation_error = _check_email_update(email, user)
        if email_validation_error:
            return (JsonResponse({'success': False, 'error': email_validation_error}, status=250))
        username_validation_error = _validate_username_update(username, user)
        if username_validation_error:
            return (JsonResponse({'success': False, 'error': username_validation_error}, status=250))
        user.username = username
        player.username = username
        user.email = email
        player.mail = email
        user.save()
        player.save()
        return (JsonResponse({'success': True, 'error': 'Profile successfully modified', 'content': {'username': username, 'email' : email}}, status=200))
    except Exception as e:
        return (JsonResponse({'success': False, 'error': str(e)}, status=500))

def _check_email_update(email, user):
    """
    Validate the email update.

    Args:
        email (str): The new email to validate.
        user (User): The current user object.

    Returns:
        str: An error message if validation fails, or None if valid.
    """
    if email and email != user.email:
        if (User.objects.filter(email=email).exists() or 
            Player.objects.filter(mail=email).exists() or 
            not _is_valid_email(email)
        ):
            return ('Invalide Credentials.')
    return (None)

def _validate_username_update(username, user):
    """
    Validate the username update.

    Args:
        username (str): The new username to validate.
        user (User): The current user object.

    Returns:
        str: An error message if validation fails, or None if valid.
    """
    if username and username != user.username:
        if User.objects.filter(username=username).exists() or Player.objects.filter(username=username).exists():
            return ('Username already in use.')
        if not _is_valid_username(username):
            return ('Invalid username format.')
    return (None)


# _____________________________________ Update Password _____________________________________


@api_view(['POST'])
@csrf_exempt
@login_required
def updatePassword(request):
    """
        Update the user's password.
        Args:
            request (HttpRequest): The HTTP request object containing old and new passwords.
        Returns:
            JsonResponse: A JSON response indicating success or failure with relevant messages.
    """
    try:
        data = request.data
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        user = User.objects.get(username=request.user)
        error = _validate_password_update(user, old_password, new_password, confirm_password)
        if error:
            return (JsonResponse({'success': False, 'error': error}, status=250))
        user.set_password(new_password)
        user.save()
        user.refresh_from_db()
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        return (JsonResponse({'success': True, 'error': 'Password successfully update', 'message': 'Password updated successfully'}, status=200))
    except User.DoesNotExist:
        return (JsonResponse({'success': False, 'error': 'User not found'}, status=250))
    except Exception as e:
        return (JsonResponse({'success': False, 'error': str(e)}, status=500))

def _validate_password_update(user, old_password, new_password, confirm_password):
    """
        Validate password update inputs.
        Args:
            user (User): The current user object.
            old_password (str): The user's current password.
            new_password (str): The user's new password.
            confirm_password (str): The confirmation for the new password.
        Returns:
            str: An error message if validation fails, or None if valid.
    """
    if not user.check_password(old_password):
        return ('Invalid old password')
    if old_password == new_password:
        return ('New password cannot be the same as the old password')
    if new_password != confirm_password:
        return ('New password and confirmation password do not match')
    if not _is_valid_password(new_password):
        return ('Password not strong. try again')
    return (None)

# _____________________________________ Update ProfilPicts _____________________________________


@csrf_exempt
@api_view(['POST'])
@login_required
def updateProfilPicsPlayer(request):
    """
        Update the player's profile picture.
        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            Response: Success status with the new avatar URL or an error message.
    """
    if request.method == 'POST' and request.FILES.get('avatar'):
        avatar = request.FILES['avatar']
        validation_error = _validate_avatar(avatar)
        if validation_error:
            return (JsonResponse({'success': False, 'error': validation_error}, status=250))
        user = request.user
        player = Player.objects.get(username=user)
        player.img = avatar
        player.save()
        return (Response({'success': True, 'new_avatar_url': player.img.url}))
    return (JsonResponse({'success': False, 'error': 'Invalid file'}, status=250))

def _validate_avatar(avatar):
    """
        Validate the uploaded avatar.
        Args:
            avatar: The uploaded avatar file.
        Returns:
            str: Error message if validation fails, or None if validation succeeds.
    """
    if not _is_valid_file_type(avatar):
        return ('Invalid file type. Only JPEG and PNG are allowed.')
    if avatar.size > 5 * 1024 * 1024:
        return ('File too large. Maximum size is 5MB.')
    return (None)

def _is_valid_file_type(avatar):
    """
        Check if the uploaded avatar file type is valid.
        Args:
            avatar: The uploaded avatar file.
        Returns:
            bool: True if the file type is valid, False otherwise.
    """
    valid_extensions = ['.png', '.jpg', '.jpeg']
    ext = os.path.splitext(avatar.name)[1].lower()
    if ext not in valid_extensions:
        return (False)
    return (avatar.content_type in ['image/png', 'image/jpeg'])


# ======================================================================================================================
# ============================================ Progress Utils METHODE  =================================================
# ======================================================================================================================


@csrf_exempt
@api_view(['GET'])
@login_required
def getCurrentElo(request):
    """
        Get the current Elo rating for a player based on the game type.
        Args:
            request (HttpRequest): The HTTP request object containing the user ID and game type.
        Returns:
            Response: A JSON response containing the Elo value or an error message.
    """
    try:
        player_id = request.query_params.get("user")
        game_type = request.query_params.get("type")
        if not player_id or not game_type:
            return Response({"error": "Missing 'user' or 'type' parameter"}, status=400)
        player = Player.objects.only("eloPong", "eloConnect4").get(id=player_id)
        elo_map = {
            "pong": player.eloPong,
            "connect4": player.eloConnect4
        }
        elo_value = elo_map.get(game_type.lower(), 0)
        return Response({'value': elo_value}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@login_required
def lastConnexion(request):
    """
        Retrieve the last connection time of a player.
        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            JsonResponse: Last connection time or an error message.
    """
    try:
        player = Player.objects.get(id=request.query_params.get('user'))
        if player.lastConnexion is None:
            return (JsonResponse({'value': 'Never'}, status=200))
        return (JsonResponse({'value': player.lastConnexion.strftime('%Y-%m-%d %H:%M:%S')}, status=200))
    except Exception as e:
        return (JsonResponse({'error': str(e)}, status=500))


# ======================================================================================================================
# ============================================= Utils Users METHODE  ===================================================
# ======================================================================================================================

import logging

logger = logging.getLogger('print')


@api_view(['GET'])
@login_required
def getUserById(request):
    try:
        userId = request.GET.get('userId')
        player = Player.objects.get(id=userId)
        player = {
            "id": player.id,
            "username": player.username,
            "img": str(player.img)
        }        
        return Response(player, status=200)
    except Player.DoesNotExist:
        return Response({"error": f"Player with id {userId} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@login_required
def getPlayerByUserName(request):
    try:
        player = Player.objects.get(username=request.query_params.get("username"))
        data = _get_player_data_serializers(player, player.id == request.user.id)
        return Response(data, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
def getPlayerById(request):
    try:
        player = Player.objects.get(id=request.query_params.get("userId"))
        data = _get_player_data_serializers(player, player.id != request.user.id)
        return Response(data, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def getPlayersByIds(request):
    try:
        players_ids = request.GET.get('playersIds')
        if not players_ids:
            return Response({"error": "Players IDs are required"}, status=400)
        players_ids = [int(id) for id in players_ids.split(',')]
        players = Player.objects.filter(id__in=players_ids)
        data = {player.id: _get_player_data_serializers(player, player.id != request.user.id) for player in players}
        return Response(data, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def getPlayer(request):
    try:
        player = Player.objects.get(username=request.user)
        data = _get_player_data_serializers(player, False) 
        return Response(data, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def _get_player_data_serializers(player, isVisitedProfil):
    """
        Create a dictionary of player data.
        Args:
            player (Player): The player object.
        Returns:
            dict: A dictionary containing player's details.
    """
    try :
        friends_count = Friends.objects.filter(player=player, status=3).count()
        data = {
            'id': player.id,
            'username': player.username,
            'mail': player.mail,
            'img': player.img.name if not player.img.name.startswith("profile_pics/") else player.img.url,
            'created_at': player.created_at,
            'eloPong': player.eloPong,
            'eloConnect4': player.eloConnect4,
            'is_online': player.is_online,
            'last_connection': player.lastConnexion,
            'friends_count': friends_count,
            'is42User': not player.img.name.startswith("profile_pics/"),
            'visitedProfile': isVisitedProfil,
        }
        return data
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required
@api_view(['GET'])
def get_me(request):
    player = Player.objects.get(username=request.user)
    if (player.img.name.startswith("profile_pics")):
        img = player.img.url
    else:
        img = player.img.name
    return JsonResponse({'id': player.id, 'username': player.username,
                        'mail': player.mail, 'img': img, 'eloPong': player.eloPong, 'eloConnect4': player.eloConnect4})
