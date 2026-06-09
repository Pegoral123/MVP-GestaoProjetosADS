from rest_framework import serializers

from apps.grupos.models import Grupo


class GrupoService:

    @staticmethod
    def listar_grupos():
        """
        Retorna todos os grupos ordenados por data de criação.
        """
        return Grupo.objects.all()
    
    @staticmethod
    def buscar_por_id(grupo_id: int) -> Grupo:
        """
        Busca um grupo pelo ID.
        Lança erro 404 se não encontrar.
        """
        try:
            return Grupo.objects.get(id=grupo_id)
        except Grupo.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Grupo não encontrado."}
            ) from exc

    @staticmethod
    def criar_grupo(data: dict) -> Grupo:
        """
        Cria um novo grupo.
        Validações de unicidade já foram feitas no serializer.
        """
        return Grupo.objects.create(**data)
    
    @staticmethod
    def atualizar_grupo(grupo: Grupo, data: dict) -> Grupo:
        """
        Atualiza os dados de um grupo.
        """
        for campo, valor in data.items():
            setattr(grupo, campo, valor)
        grupo.save()
        return grupo
    
    @staticmethod
    def deletar_grupo(grupo_id: int) -> None:
        """
        Deleta um grupo.
        Regras:
        - Não pode deletar se tiver alunos vinculados
        - Não pode deletar se tiver projeto ativo
        """
        try:
            grupo = Grupo.objects.get(id=grupo_id)
        except Grupo.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Grupo não encontrado."}
            ) from exc

        if grupo.alunos.exists():
            raise serializers.ValidationError(
                {"alunos": "Não é possível deletar um grupo que possui alunos vinculados."}
            )

        if grupo.projetos.filter(status="Ativo").exists():
            raise serializers.ValidationError(
                {"projetos": "Não é possível deletar um grupo que possui projeto ativo."}
            )

        grupo.delete()

    @staticmethod
    def listar_alunos_do_grupo(grupo_id: int):
        """
        Retorna todos os alunos de um grupo específico.
        """
        try:
            grupo = Grupo.objects.get(id=grupo_id)
        except Grupo.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Grupo não encontrado."}
            ) from exc

        return grupo.alunos.all()