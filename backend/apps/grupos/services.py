from rest_framework import serializers

from apps.grupos.models import Grupo


class GrupoService:

    @staticmethod
    def listar_grupos():
        """
        Retorna todos os grupos ordenados por data de criação.
        """
        return Grupo.objects.all()