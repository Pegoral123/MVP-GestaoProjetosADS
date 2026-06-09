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
    return Grupo.objects.create(
        codigo="FE-001",
        nome="React Ninjas",
        data="2024-01-01",
        periodo="1º Semestre",
        mvp="Frontend",
        status="Em andamento",
    )


@pytest.fixture
def grupo_com_aluno(db):
    g = Grupo.objects.create(
        codigo="BE-001",
        nome="Django Masters",
        data="2024-01-01",
        periodo="2º Semestre",
        mvp="Backend",
        status="Em andamento",
    )
    Aluno.objects.create(
        nome="João Silva",
        email="joao@email.com",
        matricula="2024001",
        grupo=g,
    )
    return g


@pytest.fixture
def aluno_sem_grupo(db):
    return Aluno.objects.create(
        nome="Maria Costa",
        email="maria@email.com",
        matricula="2024002",
    )


# ── Testes de Listagem ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_grupos_autenticado(client_autenticado, grupo):
    response = client_autenticado.get("/api/v1/grupos/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 1


@pytest.mark.django_db
def test_listar_grupos_sem_autenticacao(client):
    response = client.get("/api/v1/grupos/")
    assert response.status_code == 401


# ── Testes de Criação ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_criar_grupo_sucesso(client_autenticado):
    payload = {
        "codigo":  "MB-001",
        "nome":    "Mobile Squad",
        "data":    "2024-03-01",
        "periodo": "3º Semestre",
        "mvp":     "Mobile",
        "status":  "Em andamento",
    }
    response = client_autenticado.post("/api/v1/grupos/", payload, format="json")
    assert response.status_code == 201
    assert response.data["data"]["codigo"] == "MB-001"
    assert Grupo.objects.filter(codigo="MB-001").exists()


@pytest.mark.django_db
def test_criar_grupo_codigo_duplicado(client_autenticado, grupo):
    payload = {
        "codigo":  "FE-001",    # ← já existe
        "nome":    "Outro Grupo",
        "data":    "2024-03-01",
        "periodo": "1º Semestre",
        "mvp":     "Frontend",
        "status":  "Em andamento",
    }
    response = client_autenticado.post("/api/v1/grupos/", payload, format="json")
    assert response.status_code == 400
    assert "codigo" in response.data["errors"]


@pytest.mark.django_db
def test_criar_grupo_campos_obrigatorios(client_autenticado):
    payload = {}
    response = client_autenticado.post("/api/v1/grupos/", payload, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_criar_grupo_mvp_invalido(client_autenticado):
    payload = {
        "codigo":  "XX-001",
        "nome":    "Grupo Inválido",
        "data":    "2024-03-01",
        "periodo": "1º Semestre",
        "mvp":     "Invalido",   # ← valor fora dos choices
        "status":  "Em andamento",
    }
    response = client_autenticado.post("/api/v1/grupos/", payload, format="json")
    assert response.status_code == 400
    assert "mvp" in response.data["errors"]


@pytest.mark.django_db
def test_criar_grupo_periodo_invalido(client_autenticado):
    payload = {
        "codigo":  "XX-002",
        "nome":    "Grupo Inválido",
        "data":    "2024-03-01",
        "periodo": "6º Semestre",  # ← valor fora dos choices
        "mvp":     "Frontend",
        "status":  "Em andamento",
    }
    response = client_autenticado.post("/api/v1/grupos/", payload, format="json")
    assert response.status_code == 400
    assert "periodo" in response.data["errors"]


# ── Testes de Busca por ID ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_buscar_grupo_por_id(client_autenticado, grupo):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo.id}/")
    assert response.status_code == 200
    assert response.data["data"]["codigo"] == "FE-001"


@pytest.mark.django_db
def test_buscar_grupo_inexistente(client_autenticado):
    response = client_autenticado.get("/api/v1/grupos/9999/")
    assert response.status_code == 400


# ── Testes de Atualização ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_atualizar_grupo_put(client_autenticado, grupo):
    payload = {
        "codigo":  "FE-001",
        "nome":    "React Ninjas Atualizado",
        "data":    "2024-03-01",
        "periodo": "1º Semestre",
        "mvp":     "Frontend",
        "status":  "Em andamento",
    }
    response = client_autenticado.put(
        f"/api/v1/grupos/{grupo.id}/", payload, format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["nome"] == "React Ninjas Atualizado"


@pytest.mark.django_db
def test_atualizar_grupo_patch(client_autenticado, grupo):
    payload = {"nome": "React Ninjas Patch"}
    response = client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/", payload, format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["nome"] == "React Ninjas Patch"


# ── Testes de Exclusão ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_deletar_grupo_sem_alunos(client_autenticado, grupo):
    response = client_autenticado.delete(f"/api/v1/grupos/{grupo.id}/")
    assert response.status_code == 200
    assert not Grupo.objects.filter(id=grupo.id).exists()


@pytest.mark.django_db
def test_deletar_grupo_com_alunos(client_autenticado, grupo_com_aluno):
    response = client_autenticado.delete(f"/api/v1/grupos/{grupo_com_aluno.id}/")
    assert response.status_code == 400
    assert "alunos" in str(response.data)


# ── Testes de Alunos do Grupo ─────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_alunos_do_grupo(client_autenticado, grupo_com_aluno):
    response = client_autenticado.get(
        f"/api/v1/grupos/{grupo_com_aluno.id}/alunos/"
    )
    assert response.status_code == 200
    assert len(response.data["data"]) == 1
    assert response.data["data"][0]["nome"] == "João Silva"


@pytest.mark.django_db
def test_listar_alunos_grupo_vazio(client_autenticado, grupo):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo.id}/alunos/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 0


@pytest.mark.django_db
def test_listar_alunos_grupo_inexistente(client_autenticado):
    response = client_autenticado.get("/api/v1/grupos/9999/alunos/")
    assert response.status_code == 400


# ── Testes de Vincular Aluno ao Grupo ────────────────────────────────────────

@pytest.mark.django_db
def test_vincular_aluno_ao_grupo(client_autenticado, aluno_sem_grupo, grupo):
    payload = {"grupo": grupo.id}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno_sem_grupo.id}/vincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert response.data["data"]["grupo"] == grupo.id

    # Confirma que o grupo agora tem 1 aluno
    alunos_response = client_autenticado.get(
        f"/api/v1/grupos/{grupo.id}/alunos/"
    )
    assert len(alunos_response.data["data"]) == 1


@pytest.mark.django_db
def test_desvincular_aluno_do_grupo(client_autenticado, grupo_com_aluno):
    aluno = grupo_com_aluno.alunos.first()
    payload = {"grupo": None}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno.id}/vincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert response.data["data"]["grupo"] is None

    # Confirma que o grupo agora tem 0 alunos
    alunos_response = client_autenticado.get(
        f"/api/v1/grupos/{grupo_com_aluno.id}/alunos/"
    )
    assert len(alunos_response.data["data"]) == 0