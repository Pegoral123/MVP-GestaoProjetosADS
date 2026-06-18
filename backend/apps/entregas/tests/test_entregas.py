# apps/entregas/tests/test_entregas.py

import pytest
from datetime import date
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.alunos.models import Aluno, AlunoGrupo
from apps.authentication.models import CustomUser
from apps.entregas.models import Entrega
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
def aluno_1(db):
    return Aluno.objects.create(
        nome="João Silva",
        email="joao@email.com",
        matricula="2024001",
    )


@pytest.fixture
def aluno_2(db):
    return Aluno.objects.create(
        nome="Maria Costa",
        email="maria@email.com",
        matricula="2024002",
    )


@pytest.fixture
def aluno_3(db):
    return Aluno.objects.create(
        nome="Pedro Lima",
        email="pedro@email.com",
        matricula="2024003",
    )


@pytest.fixture
def grupo_com_alunos(db, grupo_a, aluno_1, aluno_2, aluno_3):
    """Cria um grupo com 3 alunos vinculados"""
    AlunoGrupo.objects.create(aluno=aluno_1, grupo=grupo_a)
    AlunoGrupo.objects.create(aluno=aluno_2, grupo=grupo_a)
    AlunoGrupo.objects.create(aluno=aluno_3, grupo=grupo_a)
    return grupo_a


@pytest.fixture
def entrega_1(db, grupo_com_alunos):
    return Entrega.objects.create(
        grupo=grupo_com_alunos,
        data_entrega=date(2024, 3, 15),
        apresentado=False,
    )


@pytest.fixture
def entrega_2(db, grupo_com_alunos):
    return Entrega.objects.create(
        grupo=grupo_com_alunos,
        data_entrega=date(2024, 4, 20),
        apresentado=True,
        data_apresentacao=date(2024, 4, 22),
        comentario_geral="Excelente apresentação!",
    )


# ── Testes de Autenticação ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_entregas_sem_autenticacao(client):
    """Verifica se a listagem requer autenticação"""
    response = client.get("/api/v1/entregas/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_criar_entrega_sem_autenticacao(client):
    """Verifica se a criação requer autenticação"""
    response = client.post("/api/v1/entregas/", {})
    assert response.status_code == 401


@pytest.mark.django_db
def test_obter_entrega_sem_autenticacao(client, entrega_1):
    """Verifica se obter detalhes requer autenticação"""
    response = client.get(f"/api/v1/entregas/{entrega_1.id}/")
    assert response.status_code == 401


# ── Testes de Listagem ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_entregas_vazio(client_autenticado):
    """Testa listagem quando não há entregas"""
    response = client_autenticado.get("/api/v1/entregas/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 0
    assert response.data["statusCode"] == 200


@pytest.mark.django_db
def test_listar_entregas_com_dados(client_autenticado, entrega_1, entrega_2):
    """Testa listagem de múltiplas entregas"""
    response = client_autenticado.get("/api/v1/entregas/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    assert response.data["statusCode"] == 200


@pytest.mark.django_db
def test_listar_entregas_possui_campos_obrigatorios(client_autenticado, entrega_1):
    """Testa se a listagem retorna todos os campos obrigatórios"""
    response = client_autenticado.get("/api/v1/entregas/")
    assert response.status_code == 200
    
    entrega_data = response.data["data"][0]
    assert "id" in entrega_data
    assert "grupo" in entrega_data
    assert "grupo_nome" in entrega_data
    assert "data_entrega" in entrega_data
    assert "apresentado" in entrega_data


# ── Testes de Criação ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_criar_entrega_com_dados_validos(client_autenticado, grupo_com_alunos):
    """Testa criação de entrega com dados válidos"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    assert response.data["statusCode"] == 201
    assert response.data["data"]["grupo"] == grupo_com_alunos.id
    assert Entrega.objects.count() == 1


@pytest.mark.django_db
def test_criar_entrega_com_notas(client_autenticado, grupo_com_alunos, aluno_1, aluno_2):
    """Testa criação de entrega com notas dos alunos"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 9.5},
            {"aluno": aluno_2.id, "nota": 8.0},
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    # Verifica se as notas foram lançadas
    vinculo_1 = AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos)
    vinculo_2 = AlunoGrupo.objects.get(aluno=aluno_2, grupo=grupo_com_alunos)
    assert vinculo_1.nota == 9.5
    assert vinculo_2.nota == 8.0


@pytest.mark.django_db
def test_criar_entrega_apresentado_sem_data(client_autenticado, grupo_com_alunos):
    """Testa criação com apresentado=True mas sem data_apresentacao"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": True,
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400
    assert "data_apresentacao" in str(response.data)


@pytest.mark.django_db
def test_criar_entrega_com_nota_invalida(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa validação de nota inválida (fora do intervalo 0-10)"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 15.0},  # Nota inválida
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_criar_entrega_aluno_nao_vinculado(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa criação com nota de aluno não vinculado ao grupo"""
    aluno_novo = Aluno.objects.create(
        nome="Carlos Silva",
        email="carlos@email.com",
        matricula="2024999",
    )
    
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_novo.id, "nota": 8.0},  # Aluno não vinculado
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400
    assert "não está vinculado" in str(response.data)


@pytest.mark.django_db
def test_criar_entrega_dados_incompletos(client_autenticado):
    """Testa criação com dados incompletos"""
    data = {
        "data_entrega": "2024-05-10",
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400
    assert response.data["statusCode"] == 400


# ── Testes de Detalhes ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_obter_entrega_existente(client_autenticado, entrega_1):
    """Testa obtenção de detalhes de uma entrega existente"""
    response = client_autenticado.get(f"/api/v1/entregas/{entrega_1.id}/")
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["data"]["id"] == entrega_1.id
    assert response.data["data"]["grupo"] == entrega_1.grupo.id


@pytest.mark.django_db
def test_obter_entrega_inexistente(client_autenticado):
    """Testa obtenção de entrega que não existe"""
    response = client_autenticado.get("/api/v1/entregas/9999/")
    assert response.status_code == 400


@pytest.mark.django_db
def test_obter_entrega_retorna_alunos(client_autenticado, entrega_1, grupo_com_alunos):
    """Testa se os detalhes retornam os alunos do grupo"""
    response = client_autenticado.get(f"/api/v1/entregas/{entrega_1.id}/")
    assert response.status_code == 200
    
    alunos = response.data["data"]["alunos"]
    assert len(alunos) == 3
    assert all("id" in a and "nome" in a and "nota" in a for a in alunos)


# ── Testes de Atualização (PUT) ───────────────────────────────────────────────

@pytest.mark.django_db
def test_atualizar_entrega_completo(client_autenticado, entrega_1):
    """Testa atualização completa (PUT) de uma entrega"""
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": True,
        "data_apresentacao": "2024-06-03",
        "comentario_geral": "Bom trabalho",
        "link_apresentacao": "https://youtube.com/watch?v=xyz",
    }
    response = client_autenticado.put(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["data"]["apresentado"] is True
    assert response.data["data"]["comentario_geral"] == "Bom trabalho"


@pytest.mark.django_db
def test_atualizar_entrega_com_notas(client_autenticado, entrega_1, aluno_1, aluno_2):
    """Testa atualização de entrega com novas notas"""
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 7.5},
            {"aluno": aluno_2.id, "nota": 9.0},
        ]
    }
    response = client_autenticado.put(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    
    # Verifica se as notas foram atualizadas
    vinculo_1 = AlunoGrupo.objects.get(aluno=aluno_1, grupo=entrega_1.grupo)
    assert vinculo_1.nota == 7.5


@pytest.mark.django_db
def test_atualizar_entrega_apresentado_sem_data(client_autenticado, entrega_1):
    """Testa validação ao atualizar com apresentado=True sem data"""
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": True,
    }
    response = client_autenticado.put(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_atualizar_entrega_inexistente(client_autenticado):
    """Testa atualização de entrega que não existe"""
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": False,
    }
    response = client_autenticado.put(
        "/api/v1/entregas/9999/",
        data,
        format="json"
    )
    assert response.status_code == 400


# ── Testes de Atualização Parcial (PATCH) ─────────────────────────────────────

@pytest.mark.django_db
def test_atualizar_parcial_entrega(client_autenticado, entrega_1):
    """Testa atualização parcial (PATCH) de uma entrega"""
    data = {
        "comentario_geral": "Excelente trabalho!",
    }
    response = client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["comentario_geral"] == "Excelente trabalho!"
    
    # Verifica se outros campos não foram alterados
    entrega_1.refresh_from_db()
    assert entrega_1.apresentado is False


@pytest.mark.django_db
def test_atualizar_parcial_apenas_link(client_autenticado, entrega_1):
    """Testa atualização apenas do link da apresentação"""
    data = {
        "link_apresentacao": "https://youtube.com/watch?v=abc123",
    }
    response = client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    assert response.data["data"]["link_apresentacao"] == "https://youtube.com/watch?v=abc123"


@pytest.mark.django_db
def test_atualizar_parcial_inexistente(client_autenticado):
    """Testa atualização parcial de entrega que não existe"""
    data = {"comentario_geral": "Teste"}
    response = client_autenticado.patch(
        "/api/v1/entregas/9999/",
        data,
        format="json"
    )
    assert response.status_code == 400


# ── Testes de Deleção ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_deletar_entrega(client_autenticado, entrega_1):
    """Testa deleção de uma entrega"""
    entrega_id = entrega_1.id
    response = client_autenticado.delete(f"/api/v1/entregas/{entrega_id}/")
    
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert not Entrega.objects.filter(id=entrega_id).exists()


@pytest.mark.django_db
def test_deletar_entrega_inexistente(client_autenticado):
    """Testa deleção de entrega que não existe"""
    response = client_autenticado.delete("/api/v1/entregas/9999/")
    assert response.status_code == 400


@pytest.mark.django_db
def test_deletar_entrega_reduz_contador(client_autenticado, entrega_1, entrega_2):
    """Testa se a deleção reduz o contador de entregas"""
    assert Entrega.objects.count() == 2
    
    client_autenticado.delete(f"/api/v1/entregas/{entrega_1.id}/")
    
    assert Entrega.objects.count() == 1


# ── Testes de Marcar Apresentada ──────────────────────────────────────────────

@pytest.mark.django_db
def test_marcar_apresentada(client_autenticado, entrega_1):
    """Testa marcação de entrega como apresentada"""
    data = {
        "data_apresentacao": "2024-05-20",
        "comentario_geral": "Apresentação excelente!",
    }
    response = client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/apresentar/",
        data,
        format="json"
    )
    
    assert response.status_code == 200
    assert response.data["statusCode"] == 200
    assert response.data["data"]["apresentado"] is True
    assert response.data["data"]["data_apresentacao"] == "2024-05-20"


@pytest.mark.django_db
def test_marcar_apresentada_sem_data(client_autenticado, entrega_1):
    """Testa marcação sem data de apresentação"""
    data = {
        "comentario_geral": "Apresentação excelente!",
    }
    response = client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/apresentar/",
        data,
        format="json"
    )
    
    assert response.status_code == 400
    assert "data_apresentacao" in str(response.data)


@pytest.mark.django_db
def test_marcar_apresentada_inexistente(client_autenticado):
    """Testa marcação de entrega que não existe"""
    data = {
        "data_apresentacao": "2024-05-20",
    }
    response = client_autenticado.patch(
        "/api/v1/entregas/9999/apresentar/",
        data,
        format="json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_marcar_apresentada_atualiza_campos(client_autenticado, entrega_1):
    """Testa se marcação apresentada atualiza corretamente os campos"""
    data = {
        "data_apresentacao": "2024-05-25",
        "comentario_geral": "Ótimo!",
    }
    client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/apresentar/",
        data,
        format="json"
    )
    
    entrega_1.refresh_from_db()
    assert entrega_1.apresentado is True
    assert str(entrega_1.data_apresentacao) == "2024-05-25"
    assert entrega_1.comentario_geral == "Ótimo!"


# ── Testes de Listar por Grupo ────────────────────────────────────────────────

@pytest.mark.django_db
def test_listar_entregas_por_grupo(client_autenticado, grupo_com_alunos):
    """Testa listagem de entregas de um grupo específico"""
    # Cria 2 entregas no grupo
    Entrega.objects.create(
        grupo=grupo_com_alunos,
        data_entrega=date(2024, 3, 15),
    )
    Entrega.objects.create(
        grupo=grupo_com_alunos,
        data_entrega=date(2024, 4, 20),
    )
    
    response = client_autenticado.get(f"/api/v1/entregas/grupo/{grupo_com_alunos.id}/")
    
    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    assert response.data["statusCode"] == 200


@pytest.mark.django_db
def test_listar_entregas_por_grupo_vazio(client_autenticado, grupo_com_alunos):
    """Testa listagem quando grupo não tem entregas"""
    response = client_autenticado.get(f"/api/v1/entregas/grupo/{grupo_com_alunos.id}/")
    
    assert response.status_code == 200
    assert len(response.data["data"]) == 0


@pytest.mark.django_db
def test_listar_entregas_por_grupo_grupo_inexistente(client_autenticado):
    """Testa listagem de entregas de grupo que não existe"""
    response = client_autenticado.get("/api/v1/entregas/grupo/9999/")
    
    # Retorna lista vazia (sem erro)
    assert response.status_code == 200
    assert len(response.data["data"]) == 0


@pytest.mark.django_db
def test_listar_entregas_por_grupo_nao_mistura(client_autenticado, grupo_a, grupo_b, grupo_com_alunos):
    """Testa que apenas entregas do grupo específico são retornadas"""
    # Cria entrega no grupo A
    Entrega.objects.create(
        grupo=grupo_com_alunos,
        data_entrega=date(2024, 3, 15),
    )
    
    # Cria entrega no grupo B
    Entrega.objects.create(
        grupo=grupo_b,
        data_entrega=date(2024, 4, 20),
    )
    
    # Busca entregas do grupo A
    response = client_autenticado.get(f"/api/v1/entregas/grupo/{grupo_com_alunos.id}/")
    
    assert len(response.data["data"]) == 1
    assert response.data["data"][0]["grupo"] == grupo_com_alunos.id


# ── Testes de Lançamento de Notas de Alunos ───────────────────────────────────

@pytest.mark.django_db
def test_lancar_nota_aluno_individual_na_criacao(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa lançamento de nota de um único aluno na criação"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 8.5}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    vinculo = AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos)
    assert vinculo.nota == 8.5


@pytest.mark.django_db
def test_lancar_notas_multiplos_alunos_na_criacao(client_autenticado, grupo_com_alunos, aluno_1, aluno_2, aluno_3):
    """Testa lançamento de notas para múltiplos alunos na criação"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 7.0},
            {"aluno": aluno_2.id, "nota": 8.5},
            {"aluno": aluno_3.id, "nota": 9.0}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    # Verifica cada aluno
    assert AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos).nota == 7.0
    assert AlunoGrupo.objects.get(aluno=aluno_2, grupo=grupo_com_alunos).nota == 8.5
    assert AlunoGrupo.objects.get(aluno=aluno_3, grupo=grupo_com_alunos).nota == 9.0


@pytest.mark.django_db
def test_lancar_nota_maxima_10(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa lançamento de nota máxima (10)"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 10.0}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    vinculo = AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos)
    assert vinculo.nota == 10.0


@pytest.mark.django_db
def test_lancar_nota_minima_0(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa lançamento de nota mínima (0)"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 0.0}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    vinculo = AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos)
    assert vinculo.nota == 0.0


@pytest.mark.django_db
def test_lancar_nota_com_decimal(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa lançamento de nota com casas decimais"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 7.75}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    vinculo = AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos)
    assert vinculo.nota == 7.75


@pytest.mark.django_db
def test_lancar_nota_negativa_falha(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa se lançamento de nota negativa falha"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": -1.0}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400
    assert "nota" in str(response.data).lower() or "0" in str(response.data)


@pytest.mark.django_db
def test_lancar_nota_acima_10_falha(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa se lançamento de nota acima de 10 falha"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 10.5}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_atualizar_nota_aluno_individual(client_autenticado, entrega_1, aluno_1):
    """Testa atualização de nota de um único aluno"""
    # Nota inicial
    vinculo = AlunoGrupo.objects.get(aluno=aluno_1, grupo=entrega_1.grupo)
    assert vinculo.nota is None or vinculo.nota == 0
    
    # Atualiza com nova nota
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 8.0}
        ]
    }
    response = client_autenticado.put(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    
    vinculo.refresh_from_db()
    assert vinculo.nota == 8.0


@pytest.mark.django_db
def test_atualizar_notas_multiplos_alunos(client_autenticado, entrega_1, aluno_1, aluno_2, aluno_3):
    """Testa atualização de notas de múltiplos alunos"""
    data = {
        "data_entrega": "2024-06-01",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 6.5},
            {"aluno": aluno_2.id, "nota": 7.5},
            {"aluno": aluno_3.id, "nota": 8.5}
        ]
    }
    response = client_autenticado.put(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    
    assert AlunoGrupo.objects.get(aluno=aluno_1, grupo=entrega_1.grupo).nota == 6.5
    assert AlunoGrupo.objects.get(aluno=aluno_2, grupo=entrega_1.grupo).nota == 7.5
    assert AlunoGrupo.objects.get(aluno=aluno_3, grupo=entrega_1.grupo).nota == 8.5


@pytest.mark.django_db
def test_atualizar_nota_parcial_um_aluno(client_autenticado, entrega_1, aluno_1, aluno_2):
    """Testa atualização parcial (PATCH) de nota de um aluno"""
    # Define nota inicial para ambos
    AlunoGrupo.objects.filter(grupo=entrega_1.grupo).update(nota=5.0)
    
    # Atualiza apenas um aluno
    data = {
        "notas": [
            {"aluno": aluno_1.id, "nota": 9.0}
        ]
    }
    response = client_autenticado.patch(
        f"/api/v1/entregas/{entrega_1.id}/",
        data,
        format="json"
    )
    assert response.status_code == 200
    
    assert AlunoGrupo.objects.get(aluno=aluno_1, grupo=entrega_1.grupo).nota == 9.0
    assert AlunoGrupo.objects.get(aluno=aluno_2, grupo=entrega_1.grupo).nota == 5.0


@pytest.mark.django_db
def test_lancar_nota_sem_notas_lista(client_autenticado, grupo_com_alunos):
    """Testa criação de entrega sem lançar notas"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201
    
    # Verifica que nenhuma nota foi lançada
    for aluno_grupo in AlunoGrupo.objects.filter(grupo=grupo_com_alunos):
        assert aluno_grupo.nota is None or aluno_grupo.nota == 0


@pytest.mark.django_db
def test_lancar_nota_lista_vazia(client_autenticado, grupo_com_alunos):
    """Testa criação de entrega com lista vazia de notas"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": []
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 201


@pytest.mark.django_db
def test_lancar_nota_aluno_nao_vinculado_falha(client_autenticado, grupo_com_alunos, aluno_1):
    """Testa que lançamento para aluno não vinculado ao grupo falha"""
    aluno_novo = Aluno.objects.create(
        nome="Roberto Silva",
        email="roberto@email.com",
        matricula="2024888",
    )
    
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_novo.id, "nota": 7.0}
        ]
    }
    response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    assert response.status_code == 400
    assert "não está vinculado" in str(response.data)


@pytest.mark.django_db
def test_lancar_nota_sequencia_alunos_diferentes(client_autenticado, grupo_com_alunos, aluno_1, aluno_2, aluno_3):
    """Testa lançamento de notas em sequência para alunos diferentes"""
    # Primeira entrega com notas para aluno_1 e aluno_2
    data1 = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 7.0},
            {"aluno": aluno_2.id, "nota": 8.0}
        ]
    }
    response1 = client_autenticado.post("/api/v1/entregas/", data1, format="json")
    assert response1.status_code == 201
    
    # Segunda entrega com notas para todos
    data2 = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-06-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 8.5},
            {"aluno": aluno_2.id, "nota": 9.0},
            {"aluno": aluno_3.id, "nota": 7.5}
        ]
    }
    response2 = client_autenticado.post("/api/v1/entregas/", data2, format="json")
    assert response2.status_code == 201
    
    # Verifica última entrega
    assert AlunoGrupo.objects.get(aluno=aluno_1, grupo=grupo_com_alunos).nota == 8.5
    assert AlunoGrupo.objects.get(aluno=aluno_2, grupo=grupo_com_alunos).nota == 9.0
    assert AlunoGrupo.objects.get(aluno=aluno_3, grupo=grupo_com_alunos).nota == 7.5


@pytest.mark.django_db
def test_lancar_nota_verifica_retorno_na_listagem(client_autenticado, grupo_com_alunos, aluno_1, aluno_2):
    """Testa que notas lançadas aparecem na listagem de detalhes"""
    data = {
        "grupo": grupo_com_alunos.id,
        "data_entrega": "2024-05-10",
        "apresentado": False,
        "notas": [
            {"aluno": aluno_1.id, "nota": 8.0},
            {"aluno": aluno_2.id, "nota": 7.5}
        ]
    }
    post_response = client_autenticado.post("/api/v1/entregas/", data, format="json")
    entrega_id = post_response.data["data"]["id"]
    
    # Busca detalhes
    get_response = client_autenticado.get(f"/api/v1/entregas/{entrega_id}/")
    assert get_response.status_code == 200
    
    alunos = get_response.data["data"]["alunos"]
    aluno_1_data = next((a for a in alunos if a["id"] == aluno_1.id), None)
    aluno_2_data = next((a for a in alunos if a["id"] == aluno_2.id), None)
    
    assert aluno_1_data is not None
    assert aluno_1_data["nota"] == 8.0
    assert aluno_2_data is not None
    assert aluno_2_data["nota"] == 7.5
