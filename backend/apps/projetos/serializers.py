from rest_framework import serializers

from apps.projetos.models import Projeto


class ProjetoSerializer(serializers.ModelSerializer):
    """
    Serializer completo do Projeto — usado para listagem e detalhes.
    Exibe o nome do grupo ao invés do ID.
    """

    grupo_nome = serializers.CharField(
        source="grupo.nome",
        read_only=True,
        allow_null=True,
        help_text="Nome do grupo responsável",
    )

    class Meta:
        model  = Projeto
        fields = (
            "id",
            "nome",
            "descricao",
            "mvp",
            "ano",
            "requisitos",
            "status",
            "grupo",
            "grupo_nome",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = ("id", "criado_em", "atualizado_em", "grupo_nome")


class CriarProjetoSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de projeto.
    Valida se o grupo existe e se já tem projeto ativo.
    """

    class Meta:
        model  = Projeto
        fields = (
            "nome",
            "descricao",
            "mvp",
            "ano",
            "requisitos",
            "status",
            "grupo",
        )

    def validate_grupo(self, value):
        # Verifica se o grupo já tem projeto ativo
        if Projeto.objects.filter(
            grupo=value, status="Ativo"
        ).exists():
            raise serializers.ValidationError(
                "Esse grupo já possui um projeto ativo."
            )
        return value