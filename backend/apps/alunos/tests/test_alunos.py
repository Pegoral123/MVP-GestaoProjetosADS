# apps/alunos/tests/test_alunos.py

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
def grupo_a(db):
    return Grupo.objects.create(
        nome="React Ninjas",
        data="2024-01-01",
        periodo="1º Semestre",
        mvp="Frontend",
        status="Em andamento",
    )


@pytest.fixture
def grupo_b(db):
    return Grupo.objects.create(
        nome="Django Masters",
        data="2024-01-01",
        periodo="2º Semestre",
        mvp="Backend",
        status="Em andamento",
    )


@pytest.fixture
def aluno(db):
    return Aluno.objects.create(
        nome="João Silva",
        email="joao@email.com",
        matricula="2024001",
    )


@pytest.fixture
def aluno_com_grupo(db, grupo_a):
    a = Aluno.objects.create(
        nome="Maria Costa",
        email="maria@email.com",
        matricula="2024002",
    )
    AlunoGrupo.objects.create(aluno=a, grupo=grupo_a)
    return a


@pytest.fixture
def aluno_dois_grupos(db, grupo_a, grupo_b):
    a = Aluno.objects.create(
        nome="Pedro Lima",
        email="pedro@email.com",
        matricula="2024003",
    )
    AlunoGrupo.objects.create(aluno=a, grupo=grupo_a)
    AlunoGrupo.objects.create(aluno=a, grupo=grupo_b)
    return a


# ── Testes de Listagem ────────────────────────────────────────────────────────

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
        "nome":      "Carlos Santos",
        "email":     "carlos@email.com",
        "matricula": "2024004",
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 201
    assert response.data["data"]["nome"] == "Carlos Santos"
    assert Aluno.objects.filter(matricula="2024004").exists()


@pytest.mark.django_db
def test_criar_aluno_email_duplicado(client_autenticado, aluno):
    payload = {
        "nome":      "Outro Aluno",
        "email":     "joao@email.com",   # ← já existe
        "matricula": "2024099",
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 400
    assert "email" in response.data["errors"]


@pytest.mark.django_db
def test_criar_aluno_matricula_duplicada(client_autenticado, aluno):
    payload = {
        "nome":      "Outro Aluno",
        "email":     "outro@email.com",
        "matricula": "2024001",          # ← já existe
    }
    response = client_autenticado.post("/api/v1/alunos/", payload, format="json")
    assert response.status_code == 400
    assert "matricula" in response.data["errors"]


@pytest.mark.django_db
def test_criar_aluno_campos_obrigatorios(client_autenticado):
    response = client_autenticado.post("/api/v1/alunos/", {}, format="json")
    assert response.status_code == 400


# ── Testes de Busca ───────────────────────────────────────────────────────────

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
        "nome":      "João Silva Atualizado",
        "email":     "joao@email.com",
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


# ── Testes de Exclusão ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_deletar_aluno_sem_grupo(client_autenticado, aluno):
    response = client_autenticado.delete(f"/api/v1/alunos/{aluno.id}/")
    assert response.status_code == 200
    assert not Aluno.objects.filter(id=aluno.id).exists()


@pytest.mark.django_db
def test_deletar_aluno_com_grupo(client_autenticado, aluno_com_grupo):
    response = client_autenticado.delete(f"/api/v1/alunos/{aluno_com_grupo.id}/")
    assert response.status_code == 400
    assert "grupo" in str(response.data)


# ── Testes de Vincular Grupo ──────────────────────────────────────────────────

@pytest.mark.django_db
def test_vincular_aluno_ao_grupo(client_autenticado, aluno, grupo_a):
    payload = {"grupo": grupo_a.id}
    response = client_autenticado.post(
        f"/api/v1/alunos/{aluno.id}/vincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert AlunoGrupo.objects.filter(aluno=aluno, grupo=grupo_a).exists()


@pytest.mark.django_db
def test_vincular_aluno_mesmo_grupo_duas_vezes(client_autenticado, aluno_com_grupo, grupo_a):
    payload = {"grupo": grupo_a.id}
    response = client_autenticado.post(
        f"/api/v1/alunos/{aluno_com_grupo.id}/vincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 400
    assert "grupo" in str(response.data)


@pytest.mark.django_db
def test_aluno_em_dois_grupos(client_autenticado, aluno, grupo_a, grupo_b):
    # Vincula ao grupo A
    client_autenticado.post(
        f"/api/v1/alunos/{aluno.id}/vincular-grupo/",
        {"grupo": grupo_a.id},
        format="json",
    )
    # Vincula ao grupo B
    client_autenticado.post(
        f"/api/v1/alunos/{aluno.id}/vincular-grupo/",
        {"grupo": grupo_b.id},
        format="json",
    )
    # Confirma que está nos dois grupos
    assert AlunoGrupo.objects.filter(aluno=aluno).count() == 2


# ── Testes de Desvincular Grupo ───────────────────────────────────────────────

@pytest.mark.django_db
def test_desvincular_aluno_do_grupo(client_autenticado, aluno_com_grupo, grupo_a):
    payload = {"grupo": grupo_a.id}
    response = client_autenticado.post(
        f"/api/v1/alunos/{aluno_com_grupo.id}/desvincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert not AlunoGrupo.objects.filter(
        aluno=aluno_com_grupo, grupo=grupo_a
    ).exists()


@pytest.mark.django_db
def test_desvincular_grupo_inexistente(client_autenticado, aluno, grupo_a):
    payload = {"grupo": grupo_a.id}
    response = client_autenticado.post(
        f"/api/v1/alunos/{aluno.id}/desvincular-grupo/",
        payload,
        format="json",
    )
    assert response.status_code == 400
    assert "grupo" in str(response.data)


# ── Testes de Lançar Nota ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_lancar_nota_sucesso(client_autenticado, aluno_com_grupo, grupo_a):
    payload = {"grupo": grupo_a.id, "nota": "8.50"}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno_com_grupo.id}/lancar-nota/",
        payload,
        format="json",
    )
    assert response.status_code == 200
    assert str(response.data["data"]["nota"]) == "8.50"


@pytest.mark.django_db
def test_lancar_nota_aluno_sem_vinculo(client_autenticado, aluno, grupo_a):
    payload = {"grupo": grupo_a.id, "nota": "8.50"}
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno.id}/lancar-nota/",
        payload,
        format="json",
    )
    assert response.status_code == 400
    assert "grupo" in str(response.data)


@pytest.mark.django_db
def test_lancar_nota_invalida(client_autenticado, aluno_com_grupo, grupo_a):
    payload = {"grupo": grupo_a.id, "nota": "11.00"}  # ← acima de 10
    response = client_autenticado.patch(
        f"/api/v1/alunos/{aluno_com_grupo.id}/lancar-nota/",
        payload,
        format="json",
    )
    assert response.status_code == 400
    assert "nota" in str(response.data)


@pytest.mark.django_db
def test_aluno_dois_grupos_notas_diferentes(client_autenticado, aluno_dois_grupos, grupo_a, grupo_b):
    # Lança nota no grupo A
    client_autenticado.patch(
        f"/api/v1/alunos/{aluno_dois_grupos.id}/lancar-nota/",
        {"grupo": grupo_a.id, "nota": "8.50"},
        format="json",
    )
    # Lança nota no grupo B
    client_autenticado.patch(
        f"/api/v1/alunos/{aluno_dois_grupos.id}/lancar-nota/",
        {"grupo": grupo_b.id, "nota": "9.00"},
        format="json",
    )

    # Confirma notas diferentes
    nota_a = AlunoGrupo.objects.get(aluno=aluno_dois_grupos, grupo=grupo_a).nota
    nota_b = AlunoGrupo.objects.get(aluno=aluno_dois_grupos, grupo=grupo_b).nota

    assert float(nota_a) == 8.50
    assert float(nota_b) == 9.00