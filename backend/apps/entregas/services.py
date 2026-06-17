from django.db import transaction
from rest_framework import serializers

from apps.alunos.models import AlunoGrupo
from apps.entregas.models import Entrega


class EntregaService:

    @staticmethod
    def listar_entregas():
        """
        Retorna todas as entregas ordenadas por data.
        """
        return Entrega.objects.all()

    @staticmethod
    def listar_por_grupo(grupo_id: int):
        """
        Retorna todas as entregas de um grupo específico.
        """
        return Entrega.objects.filter(grupo_id=grupo_id)

    @staticmethod
    def buscar_por_id(entrega_id: int) -> Entrega:
        """
        Busca uma entrega pelo ID.
        """
        try:
            return Entrega.objects.get(id=entrega_id)
        except Entrega.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Entrega não encontrada."}
            ) from exc

    @staticmethod
    @transaction.atomic
    def criar_entrega(data: dict) -> Entrega:
        """
        Cria uma entrega e lança as notas dos alunos de uma vez.
        """
        notas = data.pop("notas", [])

        entrega = Entrega.objects.create(**data)

        for item in notas:
            atualizado = AlunoGrupo.objects.filter(
                aluno_id=item["aluno"],
                grupo=entrega.grupo,
            ).update(nota=item["nota"])

            if not atualizado:
                raise serializers.ValidationError(
                    {"notas": f"Aluno {item['aluno']} não está vinculado a esse grupo."}
                )

        return entrega

    @staticmethod
    @transaction.atomic
    def atualizar_entrega(entrega: Entrega, data: dict) -> Entrega:
        """
        Atualiza a entrega e as notas dos alunos.
        """
        notas = data.pop("notas", [])

        for campo, valor in data.items():
            setattr(entrega, campo, valor)
        entrega.save()

        for item in notas:
            atualizado = AlunoGrupo.objects.filter(
                aluno_id=item["aluno"],
                grupo=entrega.grupo,
            ).update(nota=item["nota"])

            if not atualizado:
                raise serializers.ValidationError(
                    {"notas": f"Aluno {item['aluno']} não está vinculado a esse grupo."}
                )

        return entrega

    @staticmethod
    def deletar_entrega(entrega_id: int) -> None:
        """
        Deleta uma entrega.
        """
        try:
            entrega = Entrega.objects.get(id=entrega_id)
        except Entrega.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Entrega não encontrada."}
            ) from exc

        entrega.delete()

    @staticmethod
    def marcar_apresentada(entrega: Entrega, data_apresentacao, comentario=None) -> Entrega:
        """
        Marca a entrega como apresentada.
        """
        if not data_apresentacao:
            raise serializers.ValidationError(
                {"data_apresentacao": "Data de apresentação é obrigatória."}
            )

        entrega.apresentado      = True
        entrega.data_apresentacao = data_apresentacao
        if comentario:
            entrega.comentario_geral = comentario
        entrega.save()
        return entrega