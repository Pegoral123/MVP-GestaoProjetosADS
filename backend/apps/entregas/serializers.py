from typing import List, Dict, Any
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from apps.alunos.models import AlunoGrupo
from apps.entregas.models import Entrega


class NotaAlunoSerializer(serializers.Serializer):
    """
    Serializer para lançar nota de um aluno na entrega.
    """
    aluno = serializers.IntegerField(help_text="ID do aluno")
    nota  = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Nota do aluno (0 a 10)",
    )

    def validate_nota(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("A nota deve ser entre 0 e 10.")
        return value


class EntregaSerializer(serializers.ModelSerializer):
    """
    Serializer completo da Entrega — usado para listagem e detalhes.
    Inclui alunos do grupo com suas notas.
    """

    grupo_nome = serializers.CharField(
        source="grupo.nome",
        read_only=True,
    )

    alunos = serializers.SerializerMethodField()

    class Meta:
        model  = Entrega
        fields = (
            "id",
            "grupo",
            "grupo_nome",
            "data_entrega",
            "apresentado",
            "data_apresentacao",
            "comentario_geral",
            "link_apresentacao",
            "alunos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = (
            "id",
            "criado_em",
            "atualizado_em",
            "grupo_nome",
            "alunos",
        )

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_alunos(self, obj) -> List[Dict[str, Any]]:
        vinculos = AlunoGrupo.objects.filter(
            grupo=obj.grupo
        ).select_related("aluno")
        return [
            {
                "id":   v.aluno.id,
                "nome": v.aluno.nome,
                "nota": v.nota,
            }
            for v in vinculos
        ]


class CriarEntregaSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de entrega.
    Aceita notas dos alunos para lançar junto com a entrega.
    """

    notas = NotaAlunoSerializer(
        many=True,
        required=False,
        help_text="Notas dos alunos do grupo",
    )

    class Meta:
        model  = Entrega
        fields = (
            "grupo",
            "data_entrega",
            "apresentado",
            "data_apresentacao",
            "comentario_geral",
            "link_apresentacao",
            "notas",
        )

    def validate(self, data):
        # Se apresentado=True, data_apresentacao é obrigatória
        if data.get("apresentado") and not data.get("data_apresentacao"):
            raise serializers.ValidationError(
                {"data_apresentacao": "Data de apresentação é obrigatória quando apresentado=True."}
            )
        return data


class AtualizarEntregaSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de entrega.
    """

    notas = NotaAlunoSerializer(
        many=True,
        required=False,
        help_text="Notas dos alunos do grupo",
    )

    class Meta:
        model  = Entrega
        fields = (
            "data_entrega",
            "apresentado",
            "data_apresentacao",
            "comentario_geral",
            "link_apresentacao",
            "notas",
        )

    def validate(self, data):
        if data.get("apresentado") and not data.get("data_apresentacao"):
            raise serializers.ValidationError(
                {"data_apresentacao": "Data de apresentação é obrigatória quando apresentado=True."}
            )
        return data