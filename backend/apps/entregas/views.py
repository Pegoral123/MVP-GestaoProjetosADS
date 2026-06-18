from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.entregas.models import Entrega
from apps.entregas.serializers import (
    AtualizarEntregaSerializer,
    CriarEntregaSerializer,
    EntregaSerializer,
)
from apps.entregas.services import EntregaService


@extend_schema(tags=["Entregas"])
class EntregaListCreateView(APIView):
    """
    Lista todas as entregas ou cria uma nova.
    GET  /api/v1/entregas/
    POST /api/v1/entregas/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=EntregaSerializer(many=True))
    def get(self, request):
        entregas = EntregaService.listar_entregas()
        serializer = EntregaSerializer(entregas, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Entregas listadas com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=CriarEntregaSerializer, responses=EntregaSerializer)
    def post(self, request):
        serializer = CriarEntregaSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entrega = EntregaService.criar_entrega(serializer.validated_data)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível criar a entrega.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": EntregaSerializer(entrega).data,
                "message": "Entrega criada com sucesso.",
                "statusCode": status.HTTP_201_CREATED,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Entregas"])
class EntregaDetailView(APIView):
    """
    Busca, atualiza ou deleta uma entrega pelo ID.
    GET    /api/v1/entregas/{id}/
    PUT    /api/v1/entregas/{id}/
    PATCH  /api/v1/entregas/{id}/
    DELETE /api/v1/entregas/{id}/
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, entrega_id: int) -> Entrega:
        return EntregaService.buscar_por_id(entrega_id)

    @extend_schema(responses=EntregaSerializer)
    def get(self, request, pk):
        entrega = self.get_object(pk)
        serializer = EntregaSerializer(entrega)
        return Response(
            {
                "data": serializer.data,
                "message": "Entrega encontrada.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarEntregaSerializer, responses=EntregaSerializer)
    def put(self, request, pk):
        entrega = self.get_object(pk)
        serializer = AtualizarEntregaSerializer(entrega, data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entrega = EntregaService.atualizar_entrega(
                entrega, serializer.validated_data
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível atualizar a entrega.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": EntregaSerializer(entrega).data,
                "message": "Entrega atualizada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarEntregaSerializer, responses=EntregaSerializer)
    def patch(self, request, pk):
        entrega = self.get_object(pk)
        serializer = AtualizarEntregaSerializer(
            entrega, data=request.data, partial=True
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

        try:
            entrega = EntregaService.atualizar_entrega(
                entrega, serializer.validated_data
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível atualizar a entrega.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": EntregaSerializer(entrega).data,
                "message": "Entrega atualizada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses={200: None})
    def delete(self, request, pk):
        try:
            EntregaService.deletar_entrega(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível deletar a entrega.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Entrega deletada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Entregas"])
class EntregasPorGrupoView(APIView):
    """
    Lista todas as entregas de um grupo específico.
    GET /api/v1/grupos/{id}/entregas/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=EntregaSerializer(many=True))
    def get(self, request, pk):
        entregas = EntregaService.listar_por_grupo(pk)
        serializer = EntregaSerializer(entregas, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Entregas do grupo listadas com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Entregas"])
class MarcarApresentadaView(APIView):
    """
    Marca a entrega como apresentada.
    PATCH /api/v1/entregas/{id}/apresentar/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=EntregaSerializer)
    def patch(self, request, pk):
        entrega = EntregaService.buscar_por_id(pk)

        data_apresentacao = request.data.get("data_apresentacao")
        comentario        = request.data.get("comentario_geral")

        try:
            entrega = EntregaService.marcar_apresentada(
                entrega, data_apresentacao, comentario
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível marcar como apresentada.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": EntregaSerializer(entrega).data,
                "message": "Entrega marcada como apresentada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )