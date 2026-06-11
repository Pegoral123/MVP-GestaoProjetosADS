from rest_framework import serializers

from apps.projetos.models import Projeto


class ProjetoService:

    @staticmethod
    def listar_projetos():
        """
        Retorna todos os projetos ordenados por data de criação.
        """
        return Projeto.objects.all()

    @staticmethod
    def buscar_por_id(projeto_id: int) -> Projeto:
        """
        Busca um projeto pelo ID.
        Lança erro se não encontrar.
        """
        try:
            return Projeto.objects.get(id=projeto_id)
        except Projeto.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Projeto não encontrado."}
            ) from exc
        

    @staticmethod
    def buscar_por_grupo(grupo_id: int):
        """
        Retorna todos os projetos de um grupo específico.
        """
        return Projeto.objects.filter(grupo_id=grupo_id)

    @staticmethod
    def criar_projeto(data: dict) -> Projeto:
        """
        Cria um novo projeto.
        Validação de grupo já feita no serializer.
        """
        return Projeto.objects.create(**data)