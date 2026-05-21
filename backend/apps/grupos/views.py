from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.alunos.serializers import AlunoSerializer
from apps.grupos.models import Grupo
from apps.grupos.serializers import (
    AtualizarGrupoSerializer,
    CriarGrupoSerializer,
    GrupoSerializer,
)
from apps.grupos.services import GrupoService


@extend_schema(tags=["Grupos"])
class GrupoListCreateView(APIView):
    """
    Lista todos os grupos ou cria um novo.
    GET  /api/v1/grupos/
    POST /api/v1/grupos/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=GrupoSerializer(many=True))
    def get(self, request):
        grupos = GrupoService.listar_grupos()
        serializer = GrupoSerializer(grupos, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Grupos listados com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=CriarGrupoSerializer, responses=GrupoSerializer)
    def post(self, request):
        serializer = CriarGrupoSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        grupo = GrupoService.criar_grupo(serializer.validated_data)

        return Response(
            {
                "data": GrupoSerializer(grupo).data,
                "message": "Grupo criado com sucesso.",
                "statusCode": status.HTTP_201_CREATED,
            },
            status=status.HTTP_201_CREATED,
        )