from rest_framework import serializers

from apps.authentication.models import CustomUser
from apps.alunos.models import Aluno


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

    role = serializers.ChoiceField(
        choices=CustomUser.ROLE_CHOICES,
        help_text="Papel do usuário: ADMIN, PROFESSOR ou ALUNO",
    )

    # Campos exclusivos para ALUNO
    nome = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Nome completo do aluno (obrigatório para role ALUNO)",
    )

    matricula = serializers.CharField(
        max_length=8,
        required=False,
        help_text="Matrícula única (obrigatório para ALUNO)",
    )

    # Validações de campo único

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username já está em uso.")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já está em uso.")
        return value

    def validate_matricula(self, value):
        if value and Aluno.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Matrícula já está em uso.")
        return value

    def validate_password(self, value):
        if not any(c.isalpha() for c in value):
            msg = "A senha deve conter letras e números."
            raise serializers.ValidationError(msg)
        if not any(c.isdigit() for c in value):
            msg = "A senha deve conter letras e números."
            raise serializers.ValidationError(msg)
        return value

    # Validações cruzada dos campos

    def validate(self, data):
        if data.get("role") == "ALUNO":
            if not data.get("nome"):
                raise serializers.ValidationError(
                    {"nome": "Nome é obrigatório para alunos."}
                )
            if not data.get("matricula"):
                raise serializers.ValidationError(
                    {"matricula": "Matrícula é obrigatória para alunos."}
                )
        return data
    

class UserReponseSerializer(serializers.ModelSerializer):

    """
    Serializer para retornar os dados do usuário após o registro.
    """

    class Meta:
        model = CustomUser
        fields = ("id", "username", "email", "role")
        read_only_fields = fields
