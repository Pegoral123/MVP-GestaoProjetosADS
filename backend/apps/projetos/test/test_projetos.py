# apps/projetos/tests/test_projetos.py

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.models import CustomUser
from apps.projetos.models import Projeto


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def usuario(db):
    return CustomUser.objects.create_user(
        username="professor_teste",
        email="professor@email.com",
        password="senha123a",
    )


@pytest.fixture
def client_autenticado(client, usuario):
    refresh = RefreshToken.for_user(usuario)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def projeto_a(db):
    return Projeto.objects.create(
        nome="E-commerce Platform",
        descricao="Plataforma de e-commerce com checkout",
        mvp="Full Stack",
        ano="2024",
        requisitos="PostgreSQL, React, Django",
        status="Ativo",
    )


@pytest.fixture
def projeto_b(db):
    return Projeto.objects.create(
        nome="Chat em Tempo Real",
        descricao="Sistema de chat com WebSocket",
        mvp="Backend",
        ano="2024",
        requisitos="Node.js, Socket.io",
        status="Inativo",
    )


# ── Testes de Listagem (GET /api/v1/projetos/) ────────────────────────────────

@pytest.mark.django_db
def test_listar_projetos_autenticado(client_autenticado, projeto_a, projeto_b):
    """Deve listar todos os projetos quando autenticado."""
    response = client_autenticado.get("/api/v1/projetos/")
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert len(response.data["data"]) == 2
    assert response.data["message"] == "Projetos listados com sucesso."


@pytest.mark.django_db
def test_listar_projetos_sem_autenticacao(client):
    """Deve retornar 401 sem autenticação."""
    response = client.get("/api/v1/projetos/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_listar_projetos_vazio(client_autenticado):
    """Deve retornar lista vazia quando não há projetos."""
    response = client_autenticado.get("/api/v1/projetos/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 0


# ── Testes de Criação (POST /api/v1/projetos/) ────────────────────────────────

@pytest.mark.django_db
def test_criar_projeto_valido(client_autenticado):
    """Deve criar um novo projeto com dados válidos."""
    data = {
        "nome": "API REST",
        "descricao": "Criar uma API RESTful completa",
        "mvp": "Backend",
        "ano": "2024",
        "requisitos": "Django, DRF",
        "status": "Ativo",
    }
    response = client_autenticado.post("/api/v1/projetos/", data)
    assert response.status_code == 201
    assert response.data["statusCode"] == 201
    assert response.data["message"] == "Projeto criado com sucesso."
    assert response.data["data"]["nome"] == "API REST"


@pytest.mark.django_db
def test_criar_projeto_sem_autenticacao(client):
    """Deve retornar 401 sem autenticação."""
    data = {"nome": "Teste", "descricao": "Teste", "mvp": "Frontend", "ano": "2024"}
    response = client.post("/api/v1/projetos/", data)
    assert response.status_code == 401


@pytest.mark.django_db
def test_criar_projeto_sem_nome(client_autenticado):
    """Deve retornar 400 quando nome é obrigatório."""
    data = {
        "descricao": "Sem nome",
        "mvp": "Backend",
        "ano": "2024",
    }
    response = client_autenticado.post("/api/v1/projetos/", data)
    assert response.status_code == 400
    assert response.data["statusCode"] == 400


@pytest.mark.django_db
def test_criar_projeto_mvp_invalido(client_autenticado):
    """Deve retornar 400 quando MVP é inválido."""
    data = {
        "nome": "Projeto Teste",
        "descricao": "Descrição",
        "mvp": "Inválido",
        "ano": "2024",
    }
    response = client_autenticado.post("/api/v1/projetos/", data)
    assert response.status_code == 400


# ── Testes de Busca por ID (GET /api/v1/projetos/{id}/) ───────────────────────

@pytest.mark.django_db
def test_buscar_projeto_por_id(client_autenticado, projeto_a):
    """Deve retornar projeto específico quando encontrado."""
    response = client_autenticado.get(f"/api/v1/projetos/{projeto_a.id}/")
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["data"]["nome"] == "E-commerce Platform"
    assert response.data["message"] == "Projeto encontrado."


@pytest.mark.django_db
def test_buscar_projeto_id_inexistente(client_autenticado):
    """Deve retornar 400 quando projeto não existe."""
    response = client_autenticado.get("/api/v1/projetos/9999/")
    assert response.status_code == 400
    assert response.data["statusCode"] == 400


@pytest.mark.django_db
def test_buscar_projeto_sem_autenticacao(client, projeto_a):
    """Deve retornar 401 sem autenticação."""
    response = client.get(f"/api/v1/projetos/{projeto_a.id}/")
    assert response.status_code == 401


# ── Testes de Atualização PUT (PUT /api/v1/projetos/{id}/) ──────────────────────

@pytest.mark.django_db
def test_atualizar_projeto_completo(client_autenticado, projeto_a):
    """Deve atualizar todos os campos do projeto."""
    data = {
        "nome": "E-commerce Atualizado",
        "descricao": "Nova descrição",
        "mvp": "Mobile",
        "ano": "2025",
        "requisitos": "React Native",
        "status": "Inativo",
    }
    response = client_autenticado.put(f"/api/v1/projetos/{projeto_a.id}/", data)
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["message"] == "Projeto atualizado com sucesso."
    assert response.data["data"]["nome"] == "E-commerce Atualizado"
    assert response.data["data"]["ano"] == "2025"


@pytest.mark.django_db
def test_atualizar_projeto_id_inexistente(client_autenticado):
    """Deve retornar 400 quando projeto não existe."""
    data = {"nome": "Teste"}
    response = client_autenticado.put("/api/v1/projetos/9999/", data)
    assert response.status_code == 400


@pytest.mark.django_db
def test_atualizar_projeto_sem_autenticacao(client, projeto_a):
    """Deve retornar 401 sem autenticação."""
    data = {"nome": "Novo nome"}
    response = client.put(f"/api/v1/projetos/{projeto_a.id}/", data)
    assert response.status_code == 401


# ── Testes de Atualização PATCH (PATCH /api/v1/projetos/{id}/) ────────────────

@pytest.mark.django_db
def test_atualizar_projeto_parcial(client_autenticado, projeto_a):
    """Deve atualizar apenas alguns campos."""
    data = {"nome": "Novo Nome"}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_a.id}/", data)
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["data"]["nome"] == "Novo Nome"
    # Descrição original deve ser mantida
    assert response.data["data"]["descricao"] == "Plataforma de e-commerce com checkout"


@pytest.mark.django_db
def test_atualizar_projeto_parcial_status(client_autenticado, projeto_a):
    """Deve atualizar apenas o status."""
    data = {"status": "Inativo"}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_a.id}/", data)
    assert response.status_code == 200
    assert response.data["data"]["status"] == "Inativo"


@pytest.mark.django_db
def test_atualizar_projeto_parcial_id_inexistente(client_autenticado):
    """Deve retornar 400 quando projeto não existe."""
    data = {"nome": "Teste"}
    response = client_autenticado.patch("/api/v1/projetos/9999/", data)
    assert response.status_code == 400


# ── Testes de Deleção (DELETE /api/v1/projetos/{id}/) ────────────────────────

@pytest.mark.django_db
def test_deletar_projeto(client_autenticado, projeto_a):
    """Deve deletar um projeto."""
    projeto_id = projeto_a.id
    response = client_autenticado.delete(f"/api/v1/projetos/{projeto_id}/")
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["message"] == "Projeto deletado com sucesso."
    # Verificar que o projeto foi realmente deletado
    assert not Projeto.objects.filter(id=projeto_id).exists()


@pytest.mark.django_db
def test_deletar_projeto_id_inexistente(client_autenticado):
    """Deve retornar 400 quando projeto não existe."""
    response = client_autenticado.delete("/api/v1/projetos/9999/")
    assert response.status_code == 400


@pytest.mark.django_db
def test_deletar_projeto_sem_autenticacao(client, projeto_a):
    """Deve retornar 401 sem autenticação."""
    response = client.delete(f"/api/v1/projetos/{projeto_a.id}/")
    assert response.status_code == 401


# ── Testes de Alteração de Status (PATCH /api/v1/projetos/{id}/status/) ───────

@pytest.mark.django_db
def test_alterar_status_para_inativo(client_autenticado, projeto_a):
    """Deve alterar status de Ativo para Inativo."""
    data = {"status": "Inativo"}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_a.id}/status/", data)
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["message"] == "Status alterado para Inativo com sucesso."
    assert response.data["data"]["status"] == "Inativo"


@pytest.mark.django_db
def test_alterar_status_para_ativo(client_autenticado, projeto_b):
    """Deve alterar status de Inativo para Ativo."""
    data = {"status": "Ativo"}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_b.id}/status/", data)
    assert response.status_code == 200
    assert response.data["data"]["status"] == "Ativo"


@pytest.mark.django_db
def test_alterar_status_invalido(client_autenticado, projeto_a):
    """Deve retornar 400 para status inválido."""
    data = {"status": "Cancelado"}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_a.id}/status/", data)
    assert response.status_code == 400


@pytest.mark.django_db
def test_alterar_status_sem_campo(client_autenticado, projeto_a):
    """Deve retornar 400 quando status não é fornecido."""
    data = {}
    response = client_autenticado.patch(f"/api/v1/projetos/{projeto_a.id}/status/", data)
    assert response.status_code == 400


@pytest.mark.django_db
def test_alterar_status_id_inexistente(client_autenticado):
    """Deve retornar 400 quando projeto não existe."""
    data = {"status": "Ativo"}
    response = client_autenticado.patch("/api/v1/projetos/9999/status/", data)
    assert response.status_code == 400


@pytest.mark.django_db
def test_alterar_status_sem_autenticacao(client, projeto_a):
    """Deve retornar 401 sem autenticação."""
    data = {"status": "Inativo"}
    response = client.patch(f"/api/v1/projetos/{projeto_a.id}/status/", data)
    assert response.status_code == 401
