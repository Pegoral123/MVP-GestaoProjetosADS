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
    def criar_projeto(data: dict) -> Projeto:
        """
        Cria um novo projeto.
        """
        return Projeto.objects.create(**data)
    
    @staticmethod
    def atualizar_projeto(projeto: Projeto, data: dict) -> Projeto:
        """
        Atualiza os dados de um projeto.
        """
        for campo, valor in data.items():
            setattr(projeto, campo, valor)
        projeto.save()
        return projeto

    @staticmethod
    def deletar_projeto(projeto_id: int) -> None:
        """
        Deleta um projeto.
        """
        try:
            projeto = Projeto.objects.get(id=projeto_id)
        except Projeto.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Projeto não encontrado."}
            ) from exc
        projeto.delete()

    @staticmethod
    def alterar_status(projeto: Projeto, status: str) -> Projeto:
        """
        Altera o status do projeto — Ativo ou Inativo.
        """
        if status not in ["Ativo", "Inativo"]:
            raise serializers.ValidationError(
                {"status": "Status inválido. Use 'Ativo' ou 'Inativo'."}
            )

        projeto.status = status
        projeto.save()
        return projeto