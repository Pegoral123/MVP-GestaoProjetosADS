from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.alunos.models import Aluno
from apps.alunos.serializers import (
    AlunoGrupoSerializer,
    AlunoSerializer,
    AtualizarAlunoSerializer,
    CriarAlunoSerializer,
    DesvincularGrupoSerializer,
    LancarNotaSerializer,
    VincularGrupoSerializer,
)
from apps.alunos.services import AlunoService

@extend_schema(tags=["Alunos"])
class AlunoListCreateView(APIView):
    """
    Lista todos os alunos ou cria um novo.
    GET  /api/v1/alunos/
    POST /api/v1/alunos/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=AlunoSerializer(many=True))
    def get(self, request):
        alunos = AlunoService.listar_alunos()
        serializer = AlunoSerializer(alunos, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": "Alunos listados com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=CriarAlunoSerializer, responses=AlunoSerializer)
    def post(self, request):
        serializer = CriarAlunoSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        aluno = AlunoService.criar_aluno(serializer.validated_data)

        return Response(
            {
                "data": AlunoSerializer(aluno).data,
                "message": "Aluno criado com sucesso.",
                "statusCode": status.HTTP_201_CREATED,
            },
            status=status.HTTP_201_CREATED,
        )

@extend_schema(tags=["Alunos"])
class AlunoDetailView(APIView):
    """
    Busca, atualiza ou deleta um aluno pelo ID.
    GET    /api/v1/alunos/{id}/
    PUT    /api/v1/alunos/{id}/
    PATCH  /api/v1/alunos/{id}/
    DELETE /api/v1/alunos/{id}/
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, aluno_id: int) -> Aluno:
        return AlunoService.buscar_por_id(aluno_id)

    @extend_schema(responses=AlunoSerializer)
    def get(self, request, pk):
        aluno = self.get_object(pk)
        serializer = AlunoSerializer(aluno)
        return Response(
            {
                "data": serializer.data,
                "message": "Aluno encontrado.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarAlunoSerializer, responses=AlunoSerializer)
    def put(self, request, pk):
        aluno = self.get_object(pk)
        serializer = AtualizarAlunoSerializer(
            aluno, data=request.data
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

        aluno = AlunoService.atualizar_aluno(
            aluno, serializer.validated_data
        )

        return Response(
            {
                "data": AlunoSerializer(aluno).data,
                "message": "Aluno atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(request=AtualizarAlunoSerializer, responses=AlunoSerializer)
    def patch(self, request, pk):
        aluno = self.get_object(pk)
        serializer = AtualizarAlunoSerializer(
            aluno, data=request.data, partial=True 
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

        aluno = AlunoService.atualizar_aluno(
            aluno, serializer.validated_data
        )

        return Response(
            {
                "data": AlunoSerializer(aluno).data,
                "message": "Aluno atualizado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses={200: None})
    def delete(self, request, pk):
        try:
         AlunoService.deletar_aluno(pk)
        except serializers.ValidationError as e:
             return Response(
                 {
                     "message": "Não foi possível deletar o aluno.",
                     "statusCode": status.HTTP_400_BAD_REQUEST,
                     "errors": e.detail,
                 },
                 status=status.HTTP_400_BAD_REQUEST,
             )          
        return Response(
            {
                "message": "Aluno deletado com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

@extend_schema(tags=["Alunos"])
class VincularGrupoView(APIView):
    """
    Vincula um aluno a um grupo.
    POST /api/v1/alunos/{id}/vincular-grupo/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(request=VincularGrupoSerializer, responses=AlunoSerializer)
    def post(self, request, pk):
        aluno = AlunoService.buscar_por_id(pk)
        serializer = VincularGrupoSerializer(data=request.data)

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
            AlunoService.vincular_grupo(
                aluno,
                serializer.validated_data["grupo"],
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível vincular o aluno ao grupo.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": AlunoSerializer(aluno).data,
                "message": "Aluno vinculado ao grupo com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

@extend_schema(tags=["Alunos"])
class DesvincularGrupoView(APIView):
    """
    Desvincula um aluno de um grupo.
    POST /api/v1/alunos/{id}/desvincular-grupo/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(request=DesvincularGrupoSerializer, responses=AlunoSerializer)
    def post(self, request, pk):
        aluno = AlunoService.buscar_por_id(pk)
        serializer = DesvincularGrupoSerializer(data=request.data)

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
            AlunoService.desvincular_grupo(
                aluno,
                serializer.validated_data["grupo"],
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível desvincular o aluno do grupo.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": AlunoSerializer(aluno).data,
                "message": "Aluno desvinculado do grupo com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )
    
    
@extend_schema(tags=["Alunos"])
class LancarNotaView(APIView):
    """
    Lança ou atualiza a nota do aluno em um grupo.
    PATCH /api/v1/alunos/{id}/lancar-nota/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(request=LancarNotaSerializer, responses=AlunoGrupoSerializer)
    def patch(self, request, pk):
        aluno = AlunoService.buscar_por_id(pk)
        serializer = LancarNotaSerializer(data=request.data)

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
            vinculo = AlunoService.lancar_nota(
                aluno,
                serializer.validated_data["grupo"],
                serializer.validated_data["nota"],
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Não foi possível lançar a nota.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "data": AlunoGrupoSerializer(vinculo).data,
                "message": "Nota lançada com sucesso.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )