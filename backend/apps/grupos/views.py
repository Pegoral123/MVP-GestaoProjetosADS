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
    

@extend_schema(tags=["Grupos"])
class GrupoDetailView(APIView):
    """
    Busca, atualiza ou deleta um grupo pelo ID.
    GET    /api/v1/grupos/{id}/
    PUT    /api/v1/grupos/{id}/
    PATCH  /api/v1/grupos/{id}/
    DELETE /api/v1/grupos/{id}/
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, grupo_id: int) -> Grupo:
        return GrupoService.buscar_por_id(grupo_id)

    @extend_schema(responses=GrupoSerializer)
    def get(self, request, pk):
        grupo = self.get_object(pk)
        serializer = GrupoSerializer(grupo)
        return Response(
            {
                "data": serializer.data,
                "message": "Grupo encontrado.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarGrupoSerializer, responses=GrupoSerializer)
    def put(self, request, pk):
        grupo = self.get_object(pk)
        serializer = AtualizarGrupoSerializer(grupo, data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        grupo = GrupoService.atualizar_grupo(grupo, serializer.validated_data)

        return Response(
            {
                "data": GrupoSerializer(grupo).data,
                "message": "Grupo atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarGrupoSerializer, responses=GrupoSerializer)
    def patch(self, request, pk):
        grupo = self.get_object(pk)
        serializer = AtualizarGrupoSerializer(
            grupo, data=request.data, partial=True
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        grupo = GrupoService.atualizar_grupo(grupo, serializer.validated_data)

        return Response(
            {
                "data": GrupoSerializer(grupo).data,
                "message": "Grupo atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses={200: None})
    def delete(self, request, pk):
        try:
            GrupoService.deletar_grupo(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível deletar o grupo.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Grupo deletado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Grupos"])
class GrupoAlunosView(APIView):
    """
    Lista todos os alunos de um grupo.
    GET /api/v1/grupos/{id}/alunos/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=AlunoSerializer(many=True))
    def get(self, request, pk):
        try:
            alunos = GrupoService.listar_alunos_do_grupo(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Grupo não encontrado.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AlunoSerializer(alunos, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Alunos do grupo listados com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )