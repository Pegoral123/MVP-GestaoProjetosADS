from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.authentication.views import (
    ChangePasswordView,
    DeactivateUserView,
    LogoutView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    # Login e Token
    path("token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Registro e Logout
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Gerenciamento de usuários (ADMIN)
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/", DeactivateUserView.as_view(), name="user_deactivate"),

    #  Perfil do usuário logado
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]