from typing import Optional
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from apps.alunos.models import Aluno, AlunoGrupo
from apps.grupos.models import Grupo


class AlunoGrupoSerializer(serializers.ModelSerializer):
    grupo_nome   = serializers.CharField(source="grupo.nome", read_only=True)
    projeto_nome = serializers.SerializerMethodField()

    class Meta:
        model  = AlunoGrupo
        fields = ("id", "grupo", "grupo_nome", "projeto_nome", "nota")
        read_only_fields = ("id", "grupo_nome", "projeto_nome")

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_projeto_nome(self, obj) -> Optional[str]:
        projeto = obj.grupo.projetos.filter(status="Ativo").first()
        if projeto:
            return projeto.nome
        return None


class AlunoSerializer(serializers.ModelSerializer):
    """
    Serializer completo do Aluno — usado para listagem e detalhes.
    Exibe o nome do grupo ao invés do ID.
    """

    grupos = AlunoGrupoSerializer(
        source="aluno_grupos",
        many=True,
        read_only=True,
    )

    class Meta:
        model  = Aluno
        fields = (
            "id",
            "nome",
            "email",
            "celular",
            "matricula",
            "grupos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = ("id", "criado_em", "atualizado_em", "grupos")


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
    

class VincularGrupoSerializer(serializers.Serializer):
    grupo = serializers.PrimaryKeyRelatedField(
        queryset=Grupo.objects.all(),
        help_text="ID do grupo para vincular",
    )


class DesvincularGrupoSerializer(serializers.Serializer):
    grupo = serializers.PrimaryKeyRelatedField(
        queryset=Grupo.objects.all(),
        help_text="ID do grupo para desvincular",
    )

    
class LancarNotaSerializer(serializers.Serializer):
    grupo = serializers.PrimaryKeyRelatedField(
        queryset=Grupo.objects.all(),
        help_text="ID do grupo",
    )
    nota = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Nota do aluno nesse grupo (0 a 10)",
    )

    def validate_nota(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("A nota deve ser entre 0 e 10.")
        return value