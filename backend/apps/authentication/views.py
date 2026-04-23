# apps/authentication/views.py

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from drf_spectacular.utils import extend_schema

from apps.authentication.models import CustomUser
from apps.authentication.permissions import IsAdmin, IsAdminOrProfessor
from apps.authentication.serializers import (
    RegisterSerializer,
    UserReponseSerializer,
)
from apps.authentication.services import AuthService


class RegisterView(APIView):
    """
    Endpoint para registro de novos usuários.
    Somente ADMIN pode registrar usuários.
    POST /api/v1/auth/register/
    """

    permission_classes = [IsAdmin]

    @extend_schema(request=RegisterSerializer, responses=UserReponseSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = AuthService.registrar_usuario(serializer.validated_data)

        return Response(
            {
                "data": UserReponseSerializer(user).data,
                "message": "Usuário criado com sucesso.",
                "statusCode": status.HTTP_201_CREATED,
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """
    Endpoint para logout — invalida o refresh token
    POST /api/v1/auth/logout/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={200: None})
    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "message": "Refresh token não informado.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": {"refresh": "Campo obrigatório."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  
        except Exception:
            return Response(
                {
                    "message": "Token inválido ou já expirado.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": {},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Logout realizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """
    Endpoint para alterar senha do usuário logado.
    PATCH /api/v1/auth/change-password/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={200: None})
    def patch(self, request):
        data = {
            "senha_atual": request.data.get("senha_atual"),
            "nova_senha":  request.data.get("nova_senha"),
        }

        if not data["senha_atual"] or not data["nova_senha"]:
            return Response(
                {
                    "message": "Campos obrigatórios não informados.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": {
                        "senha_atual": "Campo obrigatório.",
                        "nova_senha":  "Campo obrigatório.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AuthService.alterar_senha(request.user, data)

        return Response(
            {
                "message": "Senha alterada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


class UserListView(generics.ListAPIView):
    """
    Endpoint para listar todos os usuários.
    Somente ADMIN pode acessar.
    GET /api/v1/auth/users/
    """

    permission_classes = [IsAdminOrProfessor]
    serializer_class = UserReponseSerializer
    queryset = CustomUser.objects.all().order_by("-date_joined")


class DeactivateUserView(APIView):
    """
    Endpoint para desativar conta de um usuário.
    Somente ADMIN pode acessar.
    DELETE /api/v1/auth/users/{id}/
    """

    permission_classes = [IsAdmin]
     
    @extend_schema(responses={200: None})
    def delete(self, request, pk):
        user = AuthService.desativar_usuario(pk)

        return Response(
            {
                "message": f"Usuário {user.username} desativado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )