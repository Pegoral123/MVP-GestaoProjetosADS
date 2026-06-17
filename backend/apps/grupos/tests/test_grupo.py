
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.alunos.models import Aluno, AlunoGrupo
from apps.authentication.models import CustomUser
from apps.grupos.models import Grupo
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


@pytest.fixture
def projeto(db):
    return Projeto.objects.create(
        nome="E-commerce Platform",
        descricao="Plataforma de e-commerce com checkout",
        mvp="Full Stack",
        ano="2024",
        requisitos="PostgreSQL, React, Django",
        status="Ativo",
    )


@pytest.fixture
def projeto_outro(db):
    return Projeto.objects.create(
        nome="Chat em Tempo Real",
        descricao="Sistema de chat com WebSocket",
        mvp="Backend",
        ano="2024",
        requisitos="Node.js, Socket.io, PostgreSQL",
        status="Ativo",
    )


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


# ── Testes de Vincular Projeto ────────────────────────────────────────────────

@pytest.mark.django_db
def test_vincular_projeto_com_sucesso(client_autenticado, grupo, projeto):
    """Testa se é possível vincular um projeto ao grupo"""
    response = client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": projeto.id},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["message"] == "Projeto vinculado com sucesso."
    assert response.data["data"]["projeto"]["id"] == projeto.id
    assert response.data["data"]["projeto"]["nome"] == "E-commerce Platform"


@pytest.mark.django_db
def test_desvincar_projeto_com_sucesso(client_autenticado, grupo, projeto):
    """Testa se é possível desvincar um projeto do grupo"""
    # Primeiro vincula o projeto
    client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": projeto.id},
        format="json",
    )

    # Depois desvincula
    response = client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": None},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["message"] == "Projeto desvinculado com sucesso."
    assert response.data["data"]["projeto"] is None


@pytest.mark.django_db
def test_vincular_projeto_invalido(client_autenticado, grupo):
    """Testa se retorna erro ao tentar vincular um projeto inválido"""
    response = client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": 99999},
        format="json",
    )
    assert response.status_code == 400
    assert response.data["message"] == "Dados inválidos."
    assert "errors" in response.data


@pytest.mark.django_db
def test_vincular_projeto_grupo_nao_existe(client_autenticado):
    """Testa se retorna erro ao vincular projeto em grupo inexistente"""
    response = client_autenticado.patch(
        "/api/v1/grupos/99999/vincular-projeto/",
        {"projeto_id": 1},
        format="json",
    )
    assert response.status_code == 400
    assert response.data["message"] == "Grupo não encontrado."


@pytest.mark.django_db
def test_vincular_projeto_troca_de_projeto(client_autenticado, grupo, projeto, projeto_outro):
    """Testa se é possível trocar de projeto vinculado ao grupo"""
    # Vincula o primeiro projeto
    client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": projeto.id},
        format="json",
    )

    # Troca para o segundo projeto
    response = client_autenticado.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": projeto_outro.id},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["data"]["projeto"]["id"] == projeto_outro.id
    assert response.data["data"]["projeto"]["nome"] == "Chat em Tempo Real"


@pytest.mark.django_db
def test_vincular_projeto_requer_autenticacao(client, grupo, projeto):
    """Testa se o endpoint requer autenticação"""
    response = client.patch(
        f"/api/v1/grupos/{grupo.id}/vincular-projeto/",
        {"projeto_id": projeto.id},
        format="json",
    )
    assert response.status_code == 401