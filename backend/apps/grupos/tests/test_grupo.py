
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.alunos.models import Aluno, AlunoGrupo
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
        nome="React Ninjas",
        data="2024-01-01",
        periodo="1º Semestre",
        mvp="Frontend",
        status="Em andamento",
    )


@pytest.fixture
def grupo_com_alunos(db):
    g = Grupo.objects.create(
        nome="Django Masters",
        data="2024-01-01",
        periodo="2º Semestre",
        mvp="Backend",
        status="Em andamento",
    )
    a1 = Aluno.objects.create(
        nome="João Silva",
        email="joao@email.com",
        matricula="2024001",
    )
    a2 = Aluno.objects.create(
        nome="Maria Costa",
        email="maria@email.com",
        matricula="2024002",
    )
    AlunoGrupo.objects.create(aluno=a1, grupo=g, nota=8.5)
    AlunoGrupo.objects.create(aluno=a2, grupo=g, nota=None)
    return g


# ── Testes do Card do Grupo ───────────────────────────────────────────────────

@pytest.mark.django_db
def test_card_grupo_campos_basicos(client_autenticado, grupo):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo.id}/")
    assert response.status_code == 200

    data = response.data["data"]
    assert data["nome"]    == "React Ninjas"
    assert data["mvp"]     == "Frontend"
    assert data["periodo"] == "1º Semestre"
    assert data["status"]  == "Em andamento"


@pytest.mark.django_db
def test_card_grupo_sem_alunos(client_autenticado, grupo):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo.id}/")
    assert response.status_code == 200

    data = response.data["data"]
    assert data["alunos"]       == []
    assert data["total_alunos"] == 0
    assert data["projeto"]      is None


@pytest.mark.django_db
def test_card_grupo_com_alunos(client_autenticado, grupo_com_alunos):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo_com_alunos.id}/")
    assert response.status_code == 200

    data = response.data["data"]
    assert data["total_alunos"] == 2
    assert len(data["alunos"])  == 2


@pytest.mark.django_db
def test_card_grupo_aluno_com_nota(client_autenticado, grupo_com_alunos):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo_com_alunos.id}/")
    data = response.data["data"]

    # Busca o João que tem nota 8.5
    joao = next(a for a in data["alunos"] if a["nome"] == "João Silva")
    assert float(joao["nota"]) == 8.5


@pytest.mark.django_db
def test_card_grupo_aluno_sem_nota(client_autenticado, grupo_com_alunos):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo_com_alunos.id}/")
    data = response.data["data"]

    # Busca a Maria que não tem nota
    maria = next(a for a in data["alunos"] if a["nome"] == "Maria Costa")
    assert maria["nota"] is None


@pytest.mark.django_db
def test_card_grupo_sem_projeto(client_autenticado, grupo):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo.id}/")
    data = response.data["data"]
    assert data["projeto"] is None


@pytest.mark.django_db
def test_card_grupo_retorna_nome_aluno(client_autenticado, grupo_com_alunos):
    response = client_autenticado.get(f"/api/v1/grupos/{grupo_com_alunos.id}/")
    data = response.data["data"]

    nomes = [a["nome"] for a in data["alunos"]]
    assert "João Silva"  in nomes
    assert "Maria Costa" in nomes