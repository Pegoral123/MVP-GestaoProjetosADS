from rest_framework import serializers

from apps.grupos.models import Grupo


class ProjetoResumoSerializer(serializers.Serializer):
    """
    Serializer resumido do projeto para exibir no card do grupo.
    Evita importação circular entre grupos e projetos.
    """
    id     = serializers.IntegerField()
    nome   = serializers.CharField()
    status = serializers.CharField()


class GrupoSerializer(serializers.ModelSerializer):
    """
    Serializer completo do Grupo — usado para listagem e detalhes.
    Inclui resumo do projeto ativo e contagem de alunos.
    """

    projeto = serializers.SerializerMethodField()
    total_alunos = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = (
            "id",
            "codigo",
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
            "projeto",
            "total_alunos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = (
            "id",
            "criado_em",
            "atualizado_em",
            "projeto",
            "total_alunos",
        )

    def get_projeto(self, obj):
        projeto = obj.projetos.filter(status="Ativo").first()
        if projeto:
            return ProjetoResumoSerializer(projeto).data
        return None

    def get_total_alunos(self, obj):
        return obj.alunos.count()


class CriarGrupoSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de grupo.
    Valida unicidade do código.
    """

    class Meta:
        model = Grupo
        fields = (
            "codigo",
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
        )

    def validate_codigo(self, value):
        if Grupo.objects.filter(codigo=value).exists():
            raise serializers.ValidationError("Código já está em uso.")
        return value


class AtualizarGrupoSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de grupo.
    Valida unicidade do código ignorando o próprio registro.
    """

    class Meta:
        model = Grupo
        fields = (
            "codigo",
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
        )

    def validate_codigo(self, value):
        if Grupo.objects.filter(codigo=value).exclude(
            pk=self.instance.pk
        ).exists():
            raise serializers.ValidationError("Código já está em uso.")
        return value