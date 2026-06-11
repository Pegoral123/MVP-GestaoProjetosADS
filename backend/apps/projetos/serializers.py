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