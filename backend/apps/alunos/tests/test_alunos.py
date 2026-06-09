import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.alunos.models import Aluno
from apps.authentication.models import CustomUser
from apps.grupos.models import Grupo


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
def grupo(db):
    return Grupo.objects.create(nome="Grupo Teste")


@pytest.fixture
def aluno(db, grupo):
    return Aluno.objects.create(
        nome="João Silva",
        email="joao@email.com",
        matricula="2024001",
    )


@pytest.fixture
def aluno_com_grupo(db, grupo):
    return Aluno.objects.create(
        nome="Maria Costa",
        email="maria@email.com",
        matricula="2024002",
        grupo=grupo,
    )


# ── Testes de Listagem ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_alunos_autenticado(client_autenticado, aluno):
    response = client_autenticado.get("/api/v1/alunos/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 1


@pytest.mark.django_db
def test_listar_alunos_sem_autenticacao(client):
    response = client.get("/api/v1/alunos/")
    assert response.status_code == 401


# ── Testes de Criação ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_criar_aluno_sucesso(client_autenticado):
    payload = {
        "nome": "Pedro Santos",
        "email": "pedro@email.com",
        "matricula": "2024003",
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 201
    assert response.data["data"]["nome"] == "Pedro Santos"
    assert Aluno.objects.filter(matricula="2024003").exists()


@pytest.mark.django_db
def test_criar_aluno_email_duplicado(client_autenticado, aluno):
    payload = {
        "nome": "Outro Aluno",
        "email": "joao@email.com",   # ← email já existe
        "matricula": "2024099",
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 400
    assert "email" in response.data["errors"]


@pytest.mark.django_db
def test_criar_aluno_matricula_duplicada(client_autenticado, aluno):
    payload = {
        "nome": "Outro Aluno",
        "email": "outro@email.com",
        "matricula": "2024001",   # ← matrícula já existe
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 400
    assert "matricula" in response.data["errors"]


@pytest.mark.django_db
def test_criar_aluno_campos_obrigatorios(client_autenticado):
    payload = {}   # ← sem campos
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 400


# ── Testes de Busca por ID ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_buscar_aluno_por_id(client_autenticado, aluno):
    response = client_autenticado.get(f"/api/v1/alunos/{aluno.id}/")
    assert response.status_code == 200
    assert response.data["data"]["matricula"] == "2024001"


@pytest.mark.django_db
def test_buscar_aluno_inexistente(client_autenticado):
    response = client_autenticado.get("/api/v1/alunos/9999/")
    assert response.status_code == 400


# ── Testes de Atualização ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_atualizar_aluno_put(client_autenticado, aluno):
    payload = {
        "nome": "João Silva Atualizado",
        "email": "joao@email.com",
        "matricula": "2024001",
    }
    response = client_autenticado.put(
        f"/api/v1/alunos/{aluno.id}/", payload, format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["nome"] == "João Silva Atualizado"


@pytest.mark.django_db
def test_atualizar_aluno_patch(client_autenticado, aluno):
    payload = {"nome": "João Patch"}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno.id}/", payload, format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["nome"] == "João Patch"


# ── Testes de Exclusão ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_deletar_aluno_sem_grupo(client_autenticado, aluno):
    response = client_autenticado.delete(f"/api/v1/alunos/{aluno.id}/")
    assert response.status_code == 200
    assert not Aluno.objects.filter(id=aluno.id).exists()


@pytest.mark.django_db
def test_deletar_aluno_com_grupo(client_autenticado, aluno_com_grupo):
    response = client_autenticado.delete(f"/api/v1/alunos/{aluno_com_grupo.id}/")
    assert response.status_code == 400
    # Verifica a mensagem de erro independente do formato
    assert "grupo" in str(response.data)


# ── Testes de Vincular Grupo ───────────────────────────────────────────────────

@pytest.mark.django_db
def test_vincular_grupo(client_autenticado, aluno, grupo):
    payload = {"grupo": grupo.id}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno.id}/vincular-grupo/", payload, format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["grupo"] == grupo.id


@pytest.mark.django_db
def test_desvincular_grupo(client_autenticado, aluno_com_grupo):
    payload = {"grupo": None}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno_com_grupo.id}/vincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert response.data["data"]["grupo"] is None