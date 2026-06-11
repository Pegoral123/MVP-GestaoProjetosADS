from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projetos.models import Projeto
from apps.projetos.serializers import (
    AtualizarProjetoSerializer,
    CriarProjetoSerializer,
    ProjetoSerializer,
)
from apps.projetos.services import ProjetoService


@extend_schema(tags=["Projetos"])
class ProjetoListCreateView(APIView):
    """
    Lista todos os projetos ou cria um novo.
    GET  /api/v1/projetos/
    POST /api/v1/projetos/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=ProjetoSerializer(many=True))
    def get(self, request):
        projetos = ProjetoService.listar_projetos()
        serializer = ProjetoSerializer(projetos, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Projetos listados com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=CriarProjetoSerializer, responses=ProjetoSerializer)
    def post(self, request):
        serializer = CriarProjetoSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        projeto = ProjetoService.criar_projeto(serializer.validated_data)

        return Response(
            {
                "data": ProjetoSerializer(projeto).data,
                "message": "Projeto criado com sucesso.",
                "statusCode": status.HTTP_201_CREATED,
            },
            status=status.HTTP_201_CREATED,
        )
