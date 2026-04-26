from rest_framework import serializers

from apps.authentication.models import CustomUser


class RegisterSerializer(serializers.Serializer):

    """
    Serializer para registro de novos usuários.
    Campos nome e matricula são obrigatórios apenas para role ALUNO.
    """

    username = serializers.CharField(
        max_length=150,
        help_text="Nome de usuário para login",
    )

    email = serializers.EmailField(
        help_text="Endereço de email único",
    )

    password = serializers.CharField(
        min_length=8,
        write_only=True,
        help_text="Senha com no mínimo 8 caracteres",
    )

    # Validações de campo único
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username deve ter no mínimo 3 caracteres."
            )
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username já está em uso.")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já está em uso.")
        return value

    def validate_password(self, value):
        if not any(c.isalpha() for c in value):
            msg = "A senha deve conter letras e números."
            raise serializers.ValidationError(msg)
        if not any(c.isdigit() for c in value):
            msg = "A senha deve conter letras e números."
            raise serializers.ValidationError(msg)
        return value


class UserReponseSerializer(serializers.ModelSerializer):

    """
    Serializer para retornar os dados do usuário após o registro.
    """

    class Meta:
        model = CustomUser
        fields = ("id", "username", "email")
        read_only_fields = fields


class ChangePasswordSerializer(serializers.Serializer):
    senha_atual = serializers.CharField(
        write_only=True,
        help_text="Senha atual do usuário",
    )
    nova_senha = serializers.CharField(
        min_length=8,
        write_only=True,
        help_text="Nova senha com no mínimo 8 caracteres",
    )


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        help_text="Refresh token para invalidar"
    )