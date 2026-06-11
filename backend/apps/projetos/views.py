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


@extend_schema(tags=["Projetos"])
class ProjetoDetailView(APIView):
    """
    Busca, atualiza ou deleta um projeto pelo ID.
    GET    /api/v1/projetos/{id}/
    PUT    /api/v1/projetos/{id}/
    PATCH  /api/v1/projetos/{id}/
    DELETE /api/v1/projetos/{id}/
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, projeto_id: int) -> Projeto:
        return ProjetoService.buscar_por_id(projeto_id)

    @extend_schema(responses=ProjetoSerializer)
    def get(self, request, pk):
        projeto = self.get_object(pk)
        serializer = ProjetoSerializer(projeto)
        return Response(
            {
                "data": serializer.data,
                "message": "Projeto encontrado.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarProjetoSerializer, responses=ProjetoSerializer)
    def put(self, request, pk):
        projeto = self.get_object(pk)
        serializer = AtualizarProjetoSerializer(projeto, data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        projeto = ProjetoService.atualizar_projeto(
            projeto, serializer.validated_data
        )

        return Response(
            {
                "data": ProjetoSerializer(projeto).data,
                "message": "Projeto atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarProjetoSerializer, responses=ProjetoSerializer)
    def patch(self, request, pk):
        projeto = self.get_object(pk)
        serializer = AtualizarProjetoSerializer(
            projeto, data=request.data, partial=True
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

        projeto = ProjetoService.atualizar_projeto(
            projeto, serializer.validated_data
        )

        return Response(
            {
                "data": ProjetoSerializer(projeto).data,
                "message": "Projeto atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses={200: None})
    def delete(self, request, pk):
        try:
            ProjetoService.deletar_projeto(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível deletar o projeto.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Projeto deletado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Projetos"])
class ProjetoAlterarStatusView(APIView):
    """
    Altera o status do projeto — Ativo ou Inativo.
    PATCH /api/v1/projetos/{id}/status/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=ProjetoSerializer)
    def patch(self, request, pk):
        projeto = ProjetoService.buscar_por_id(pk)
        novo_status = request.data.get("status")

        if not novo_status:
            return Response(
                {
                    "message": "Campo status é obrigatório.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": {"status": "Campo obrigatório."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            projeto = ProjetoService.alterar_status(projeto, novo_status)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Status inválido.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": ProjetoSerializer(projeto).data,
                "message": f"Status alterado para {novo_status} com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )