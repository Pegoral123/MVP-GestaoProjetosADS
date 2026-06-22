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


@extend_schema(
    tags=["Entregas"],
    summary="Listar todas as entregas",
    description="Retorna uma lista de todas as entregas cadastradas no sistema. "
                "Cada entrega inclui informações do grupo, alunos vinculados e suas notas.",
)
class EntregaListCreateView(APIView):
    """
    ╔════════════════════════════════════════════════════════════════╗
    ║                    GERENCIAR ENTREGAS                         ║
    ║  Lista todas as entregas ou cria uma nova entrega             ║
    ╚════════════════════════════════════════════════════════════════╝
    
    GET  /api/v1/entregas/
        → Retorna lista de todas as entregas com detalhes
        
    POST /api/v1/entregas/
        → Cria uma nova entrega e opcionalmente lança notas dos alunos
    
    Autenticação: Obrigatória (Token JWT)
    Permissões: IsAuthenticated
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="entregas_list",
        summary="Listar todas as entregas",
        description="Retorna uma lista completa de todas as entregas com informações "
                    "de grupo, data de entrega, status de apresentação e dados dos alunos.",
        responses={200: EntregaSerializer(many=True)},
    )
    def get(self, request):
        """
        Busca todas as entregas do sistema.
        
        Retorna um array com todas as entregas cadastradas, contendo:
        - ID, grupo, data de entrega, status de apresentação
        - Lista de alunos do grupo com suas notas individuais
        """
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

    @extend_schema(
        operation_id="entregas_create",
        summary="Criar uma nova entrega",
        description="Cria uma nova entrega para um grupo. Opcionalmente, permite "
                    "lançar notas de múltiplos alunos do grupo simultaneamente.",
        request=CriarEntregaSerializer,
        responses={201: EntregaSerializer},
    )
    def post(self, request):
        """
        Cria uma nova entrega.
        
        Campos requeridos:
        - grupo (int): ID do grupo que fará a entrega
        - data_entrega (date): Data da entrega (YYYY-MM-DD)
        - apresentado (bool): Se já foi apresentado
        
        Campos opcionais:
        - data_apresentacao (date): Data da apresentação (obrigatória se apresentado=true)
        - comentario_geral (text): Comentário geral do professor
        - link_apresentacao (url): Link do vídeo ou slides
        - notas (array): Array de objetos {aluno: int, nota: decimal}
        
        Validações:
        - Notas devem estar entre 0 e 10
        - Se apresentado=true, data_apresentacao é obrigatória
        - Alunos das notas devem estar vinculados ao grupo
        """
        serializer = CriarEntregaSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos. Verifique os campos obrigatórios.",
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
                    "message": "Erro ao criar a entrega. Verifique os dados informados.",
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


@extend_schema(
    tags=["Entregas"],
    summary="Gerenciar entrega específica",
    description="Obtém detalhes de uma entrega, atualiza parcial ou completamente, "
                "ou deleta uma entrega pelo seu ID.",
)
class EntregaDetailView(APIView):
    """
    ╔════════════════════════════════════════════════════════════════╗
    ║              DETALHES DE UMA ENTREGA ESPECÍFICA                ║
    ║  Busca, atualiza (parcial/completa) ou deleta uma entrega     ║
    ╚════════════════════════════════════════════════════════════════╝
    
    GET    /api/v1/entregas/{id}/
        → Retorna detalhes completos de uma entrega
        
    PUT    /api/v1/entregas/{id}/
        → Atualização completa (todos os campos devem ser enviados)
        
    PATCH  /api/v1/entregas/{id}/
        → Atualização parcial (apenas campos modificados)
        
    DELETE /api/v1/entregas/{id}/
        → Remove uma entrega do sistema
    
    Parâmetros de URL:
        {id} - ID da entrega (integer)
    
    Autenticação: Obrigatória (Token JWT)
    Permissões: IsAuthenticated
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, entrega_id: int) -> Entrega:
        """Busca uma entrega pelo ID ou lança erro de validação."""
        return EntregaService.buscar_por_id(entrega_id)

    @extend_schema(
        operation_id="entregas_retrieve",
        summary="Obter detalhes de uma entrega",
        description="Retorna os dados completos de uma entrega específica, incluindo "
                    "informações do grupo, alunos vinculados com suas notas e histórico.",
        responses={200: EntregaSerializer},
    )
    def get(self, request, pk):
        """
        Obtém os detalhes completos de uma entrega.
        
        Parâmetro:
            pk (int): ID da entrega
        
        Retorna:
            - Dados da entrega (ID, grupo, datas, status, comentários)
            - Lista de alunos do grupo com suas notas individuais
        
        Erros possíveis:
            400: Entrega não encontrada
        """
        try:
            entrega = self.get_object(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Entrega não encontrada.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        serializer = EntregaSerializer(entrega)
        return Response(
            {
                "data": serializer.data,
                "message": "Entrega encontrada.",
                "statusCode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        operation_id="entregas_update",
        summary="Atualizar entrega (completo)",
        description="Atualiza TODOS os campos de uma entrega. Utilize PUT para "
                    "atualização completa ou PATCH para atualização parcial.",
        request=AtualizarEntregaSerializer,
        responses={200: EntregaSerializer},
    )
    def put(self, request, pk):
        """
        Atualiza completamente uma entrega (substituição total).
        
        Todos os campos devem ser enviados. Campos não enviados serão
        considerados como nulos/vazios.
        
        Campos disponíveis para atualização:
        - data_entrega (date)
        - apresentado (bool)
        - data_apresentacao (date, obrigatória se apresentado=true)
        - comentario_geral (text)
        - link_apresentacao (url)
        - notas (array): {aluno: int, nota: decimal(0-10)}
        """
        try:
            entrega = self.get_object(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Entrega não encontrada.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        serializer = AtualizarEntregaSerializer(entrega, data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos. Verifique os campos.",
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
                    "message": "Erro ao atualizar a entrega.",
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

    @extend_schema(
        operation_id="entregas_partial_update",
        summary="Atualizar entrega (parcial)",
        description="Atualiza APENAS os campos enviados na requisição. "
                    "Campos não enviados não serão alterados.",
        request=AtualizarEntregaSerializer,
        responses={200: EntregaSerializer},
    )
    def patch(self, request, pk):
        """
        Atualiza parcialmente uma entrega (apenas campos fornecidos).
        
        Apenas os campos enviados serão atualizados. Campos não enviados
        mantêm seus valores anteriores.
        
        Exemplo: Enviar apenas {"comentario_geral": "Novo comentário"}
        atualizará apenas o comentário, mantendo outros campos inalterados.
        
        Campos disponíveis:
        - data_entrega (date)
        - apresentado (bool)
        - data_apresentacao (date)
        - comentario_geral (text)
        - link_apresentacao (url)
        - notas (array)
        """
        try:
            entrega = self.get_object(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Entrega não encontrada.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        serializer = AtualizarEntregaSerializer(
            entrega, data=request.data, partial=True
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Dados inválidos. Verifique os campos.",
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
                    "message": "Erro ao atualizar a entrega.",
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

    @extend_schema(
        operation_id="entregas_destroy",
        summary="Deletar uma entrega",
        description="Remove uma entrega do sistema. Esta ação é irreversível.",
        responses={200: None},
    )
    def delete(self, request, pk):
        """
        Deleta uma entrega do sistema.
        
        AVISO: Esta operação é irreversível. Todos os dados da entrega
        serão permanentemente removidos.
        
        Parâmetro:
            pk (int): ID da entrega a ser deletada
        
        Resposta de sucesso: Mensagem de confirmação
        Erros possíveis:
            400: Entrega não encontrada ou erro na deleção
        """
        try:
            EntregaService.deletar_entrega(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Erro ao deletar a entrega.",
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


@extend_schema(
    tags=["Entregas"],
    summary="Listar entregas de um grupo",
    description="Retorna todas as entregas realizadas por um grupo específico, "
                "com informações completas de cada entrega e notas dos alunos.",
)
class EntregasPorGrupoView(APIView):
    """
    ╔════════════════════════════════════════════════════════════════╗
    ║          ENTREGAS FILTRADAS POR GRUPO                         ║
    ║  Lista todas as entregas de um grupo específico               ║
    ╚════════════════════════════════════════════════════════════════╝
    
    GET /api/v1/entregas/grupo/{id}/
        → Retorna lista de entregas do grupo especificado
    
    Parâmetros de URL:
        {id} - ID do grupo (integer)
    
    Casos de uso:
        - Visualizar histórico de entregas de um grupo
        - Acompanhar progresso de um grupo ao longo do semestre
        - Comparar notas entre diferentes entregas do mesmo grupo
    
    Autenticação: Obrigatória (Token JWT)
    Permissões: IsAuthenticated
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="entregas_by_group",
        summary="Listar entregas de um grupo",
        description="Retorna uma lista de todas as entregas do grupo especificado, "
                    "ordenadas por data. Se o grupo não tiver entregas, retorna lista vazia.",
        responses={200: EntregaSerializer(many=True)},
    )
    def get(self, request, pk):
        """
        Obtém todas as entregas de um grupo específico.
        
        Parâmetro:
            pk (int): ID do grupo
        
        Retorna:
            Array com todas as entregas do grupo, contendo:
            - ID, data de entrega, status de apresentação
            - Dados de todos os alunos com suas notas
            - Comentários e links
        
        Notas:
            - Se o grupo não existir ou não tiver entregas, retorna array vazio
            - Útil para ver o histórico de desempenho de um grupo
        """
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


@extend_schema(
    tags=["Entregas"],
    summary="Marcar entrega como apresentada",
    description="Marca uma entrega como apresentada e registra a data da apresentação "
                "e comentários gerais do professor.",
)
class MarcarApresentadaView(APIView):
    """
    ╔════════════════════════════════════════════════════════════════╗
    ║         REGISTRAR APRESENTAÇÃO DA ENTREGA                     ║
    ║  Marca uma entrega como apresentada e registra dados          ║
    ╚════════════════════════════════════════════════════════════════╝
    
    PATCH /api/v1/entregas/{id}/apresentar/
        → Marca a entrega como apresentada com dados da apresentação
    
    Parâmetros de URL:
        {id} - ID da entrega (integer)
    
    Campos do request:
        - data_apresentacao (date): Data em que foi apresentado [OBRIGATÓRIO]
        - comentario_geral (text): Comentário geral do professor [Opcional]
    
    Exemplo de request:
        {
            "data_apresentacao": "2024-05-25",
            "comentario_geral": "Excelente trabalho com boa documentação!"
        }
    
    Autenticação: Obrigatória (Token JWT)
    Permissões: IsAuthenticated
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="entregas_mark_presented",
        summary="Marcar entrega como apresentada",
        description="Registra que uma entrega foi apresentada, atualizando o status "
                    "para apresentado=true e registrando a data e comentários.",
        request=AtualizarEntregaSerializer,
        responses={200: EntregaSerializer},
    )
    def patch(self, request, pk):
        """
        Marca uma entrega como apresentada.
        
        Parâmetro:
            pk (int): ID da entrega
        
        Dados obrigatórios:
            - data_apresentacao (date): Data da apresentação (YYYY-MM-DD)
        
        Dados opcionais:
            - comentario_geral (text): Feedback do professor sobre a apresentação
        
        Efeitos:
            - Atualiza apresentado = true
            - Registra data_apresentacao
            - Adiciona/atualiza comentário geral se fornecido
        
        Validações:
            - Entrega deve existir
            - data_apresentacao é obrigatória
            - data_apresentacao deve ser uma data válida
        
        Exemplo de sucesso:
            HTTP 200 OK
            {
                "data": {entrega_data},
                "message": "Entrega marcada como apresentada com sucesso.",
                "statusCode": 200
            }
        """
        try:
            entrega = EntregaService.buscar_por_id(pk)
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Entrega não encontrada.",
                    "statusCode": status.HTTP_400_BAD_REQUEST,
                    "errors": e.detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data_apresentacao = request.data.get("data_apresentacao")
        comentario        = request.data.get("comentario_geral")

        try:
            entrega = EntregaService.marcar_apresentada(
                entrega, data_apresentacao, comentario
            )
        except serializers.ValidationError as e:
            return Response(
                {
                    "message": "Erro ao marcar como apresentada. Verifique os dados.",
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