# ======================================================================================================================
# ==================================================== Include  ========================================================
# ======================================================================================================================



# _____________________________________ Django Imports _____________________________________


from django.shortcuts import render
from django.http import HttpResponse


# _____________________________________ Local Application Imports _____________________________________


from users.models import Player
from users.login_required import login_required, not_login_required


# ======================================================================================================================
# ============================================= LOGIN/REGISTER Methode  ================================================
# ======================================================================================================================


@not_login_required
def login(request):
    return render(request, 'login/login.html', {'no_footer': True})


# ======================================================================================================================
# ================================================== PROFIL Methode  ===================================================
# ======================================================================================================================


# _____________________________________ Profil _____________________________________


@login_required
def profil(request):
    player = Player.objects.get(username=request.GET.get('username', request.user.username))
    return render(request, 'profil/profil.html', {'playerId': player.id})



# ======================================================================================================================
# ================================================= PROGRESS Methode  ==================================================
# ======================================================================================================================


@login_required
@login_required
def progress(request):
    player = Player.objects.get(username=request.GET.get('username', request.user.username))
    type = request.GET.get('type')
    context = { 'playerId': player.id}
    if type is None:
        return render(request, 'profil/profil.html', context)
    return render(request, 'progress/progress.html', {'type': type, **context})
