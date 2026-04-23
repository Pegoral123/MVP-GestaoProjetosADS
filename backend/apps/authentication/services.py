# apps/authentication/services.py

from django.db import transaction
from rest_framework import serializers

from apps.alunos.models import Aluno
from apps.authentication.models import CustomUser


class AuthService:

    @staticmethod
    @transaction.atomic
    def registrar_usuario(data: dict) -> CustomUser:

        """
        Cria o CustomUser e, se role for ALUNO,
        cria o Aluno vinculado ao usuário.
        """

        # Cria o login
        user = CustomUser.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            role=data["role"],
        )

        # 2. Se for ALUNO, cria o registro acadêmico e vincula
        if data["role"] == "ALUNO":
            # noinspection PyUnresolvedReference
            Aluno.objects.create(
                nome=data["nome"],
                matricula=data["matricula"],
                email=data["email"],
                usuario=user,  
            )

        return user

    @staticmethod
    def alterar_senha(user: CustomUser, data: dict) -> CustomUser:
        """
        Valida a senha atual e aplica a nova senha
        """

        # 1. Verifica se a senha atual está correta
        if not user.check_password(data["senha_atual"]):
            raise serializers.ValidationError(
                {"senha_atual": "Senha atual incorreta."}
            )

        # 2. Verifica se a nova senha é diferente da atual
        if data["senha_atual"] == data["nova_senha"]:
            raise serializers.ValidationError(
                {"nova_senha": "A nova senha deve ser diferente da atual."}
            )

        # 3. Aplica o hash e salva
        user.set_password(data["nova_senha"])
        user.save()

        return user

    @staticmethod
    def desativar_usuario(user_id: int) -> CustomUser:
        """
        Desativa a conta do usuário sem deletar do banco.
        Somente ADMIN pode chamar esse método.
        """

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist as exc:
            # noinspection PyUnresolvedReference
            raise serializers.ValidationError(
                {"id": "Usuário não encontrado."}
            ) from exc

        if not user.is_active:
            raise serializers.ValidationError(
                {"id": "Usuário já está desativado."}
            )

        user.is_active = False
        user.save()

        return user
