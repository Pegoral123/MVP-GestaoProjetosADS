from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.grupos.models import Grupo


class AlunoResumoSerializer(serializers.Serializer):
    """
    Serializer resumido do aluno para exibir no card do grupo.
    Inclui nome e nota.
    """
    id   = serializers.IntegerField()
    nome = serializers.CharField()
    nota = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        allow_null=True,
    )


class ProjetoResumoSerializer(serializers.Serializer):
    id     = serializers.IntegerField()
    nome   = serializers.CharField()
    status = serializers.CharField()


class GrupoSerializer(serializers.ModelSerializer):
    projeto      = serializers.SerializerMethodField()
    total_alunos = serializers.SerializerMethodField()
    alunos       = serializers.SerializerMethodField()

    class Meta:
        model  = Grupo
        fields = (
            "id",
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
            "projeto",
            "alunos",
            "total_alunos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = (
            "id",
            "criado_em",
            "atualizado_em",
            "projeto",
            "alunos",
            "total_alunos",
        )

    @extend_schema_field(ProjetoResumoSerializer)
    def get_projeto(self, obj):
        projeto = obj.projetos.filter(status="Ativo").first()
        if projeto:
            return ProjetoResumoSerializer(projeto).data
        return None

    @extend_schema_field(AlunoResumoSerializer(many=True))
    def get_alunos(self, obj):
        vinculos = obj.aluno_grupos.select_related("aluno").all()
        return [
            {
                "id":   v.aluno.id,
                "nome": v.aluno.nome,
                "nota": v.nota,
            }
            for v in vinculos
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_total_alunos(self, obj):
        return obj.aluno_grupos.count()


class CriarGrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Grupo
        fields = (
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
        )

    def validate_nome(self, value):
        if Grupo.objects.filter(nome=value).exists():
            raise serializers.ValidationError("Nome já está em uso.")
        return value


class AtualizarGrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Grupo
        fields = (
            "nome",
            "data",
            "periodo",
            "mvp",
            "github_url",
            "status",
        )

    def validate_nome(self, value):
        if Grupo.objects.filter(nome=value).exclude(
            pk=self.instance.pk
        ).exists():
            raise serializers.ValidationError("Nome já está em uso.")
        return value