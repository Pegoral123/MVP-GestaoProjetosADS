"""
╔════════════════════════════════════════════════════════════════════════════╗
║                    ROTAS DE ENTREGAS - API v1                             ║
║                                                                            ║
║  Documentação de endpoints para gerenciamento de entregas de projetos     ║
╚════════════════════════════════════════════════════════════════════════════╝

ENDPOINTS DISPONÍVEIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  GERENCIAR ENTREGAS (Listar/Criar)
    ├─ GET  /api/v1/entregas/
    │  └─ Retorna lista de todas as entregas com detalhes
    └─ POST /api/v1/entregas/
       └─ Cria uma nova entrega e opcionalmente lança notas

2️⃣  GERENCIAR ENTREGA ESPECÍFICA (GET/PUT/PATCH/DELETE)
    ├─ GET    /api/v1/entregas/{id}/
    │  └─ Retorna detalhes completos de uma entrega
    ├─ PUT    /api/v1/entregas/{id}/
    │  └─ Atualiza todos os campos da entrega
    ├─ PATCH  /api/v1/entregas/{id}/
    │  └─ Atualiza apenas campos especificados
    └─ DELETE /api/v1/entregas/{id}/
       └─ Remove uma entrega do sistema

3️⃣  MARCAR COMO APRESENTADA
    └─ PATCH /api/v1/entregas/{id}/apresentar/
       └─ Registra apresentação com data e comentários

4️⃣  FILTRAR POR GRUPO
    └─ GET /api/v1/entregas/grupo/{id}/
       └─ Lista todas as entregas de um grupo específico

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTENTICAÇÃO:
    • Todas as rotas requerem autenticação JWT
    • Header: Authorization: Bearer <access_token>

PERMISSÕES:
    • IsAuthenticated: Usuário autenticado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from django.urls import path

from apps.entregas.views import (
    EntregaDetailView,
    EntregaListCreateView,
    EntregasPorGrupoView,
    MarcarApresentadaView,
)

urlpatterns = [
    # ──────────────────────────────────────────────────────────────────
    # 1. LISTAR TODAS AS ENTREGAS E CRIAR NOVA
    # ──────────────────────────────────────────────────────────────────
    path(
        "",
        EntregaListCreateView.as_view(),
        name="entrega-list-create"
    ),
    
    # ──────────────────────────────────────────────────────────────────
    # 2. DETALHE, ATUALIZAR (PUT/PATCH) E DELETAR ENTREGA
    # ──────────────────────────────────────────────────────────────────
    path(
        "<int:pk>/",
        EntregaDetailView.as_view(),
        name="entrega-detail"
    ),
    
    # ──────────────────────────────────────────────────────────────────
    # 3. MARCAR ENTREGA COMO APRESENTADA
    # ──────────────────────────────────────────────────────────────────
    path(
        "<int:pk>/apresentar/",
        MarcarApresentadaView.as_view(),
        name="entrega-apresentar"
    ),
    
    # ──────────────────────────────────────────────────────────────────
    # 4. LISTAR ENTREGAS DE UM GRUPO ESPECÍFICO
    # ──────────────────────────────────────────────────────────────────
    path(
        "grupo/<int:pk>/",
        EntregasPorGrupoView.as_view(),
        name="entrega-por-grupo"
    ),
]

