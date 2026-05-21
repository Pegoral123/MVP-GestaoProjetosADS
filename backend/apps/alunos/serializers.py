from rest_framework import serializers

from apps.alunos.models import Aluno


class AlunoSerializer(serializers.ModelSerializer):
    """
    Serializer completo do Aluno — usado para listagem e detalhes.
    Exibe o nome do grupo ao invés do ID.
    """

    grupo_nome = serializers.CharField(
        source="grupo.nome",
        read_only=True,
        allow_null=True,
        help_text="Nome do grupo do aluno",
    )

    class Meta:
        model = Aluno
        fields = (
            "id",
            "nome",
            "email",
            "celular",
            "matricula",
            "grupo",
            "grupo_nome",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = ("id", "criado_em", "atualizado_em", "grupo_nome")


class CriarAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de aluno.
    Valida unicidade de email e matrícula.
    """

    class Meta:
        model = Aluno
        fields = (
            "nome",
            "email",
            "celular",
            "matricula",
            "grupo",
        )

    def validate_email(self, value):
        if Aluno.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já está em uso.")
        return value

    def validate_matricula(self, value):
        if Aluno.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Matrícula já está em uso.")
        return value


class AtualizarAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de aluno.
    Valida unicidade ignorando o próprio registro.
    """

    class Meta:
        model = Aluno
        fields = (
            "nome",
            "email",
            "celular",
            "matricula",
            "grupo",
        )

    def validate_email(self, value):
       
        if Aluno.objects.filter(email=value).exclude(
            pk=self.instance.pk
        ).exists():
            raise serializers.ValidationError("Email já está em uso.")
        return value

    def validate_matricula(self, value):
        if Aluno.objects.filter(matricula=value).exclude(
            pk=self.instance.pk
        ).exists():
            raise serializers.ValidationError("Matrícula já está em uso.")
        return value
    

class VincularGrupoSerializer(serializers.ModelSerializer):
    """
    Serializer para vincular ou desvincular aluno de um grupo.
    Só aceita o campo grupo.
    """

    class Meta:
        model = Aluno
        fields = ("grupo",)

    def validate_grupo(self, value):
        if value is None:
            return value  # desvincula — aceita null

        # Verifica se o aluno já pertence a esse grupo
        if self.instance and self.instance.grupo == value:
            raise serializers.ValidationError(
                "Aluno já pertence a esse grupo."
            )
        return value