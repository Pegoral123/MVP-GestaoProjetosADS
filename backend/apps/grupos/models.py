from django.db import models


class Grupo(models.Model):
    """
    Representa um grupo de alunos vinculado a um projeto.
    """

    class Periodo(models.TextChoices):
        PRIMEIRO  = "1º Semestre", "1º Semestre"
        SEGUNDO   = "2º Semestre", "2º Semestre"
        TERCEIRO  = "3º Semestre", "3º Semestre"
        QUARTO    = "4º Semestre", "4º Semestre"
        QUINTO    = "5º Semestre", "5º Semestre"

    class MVP(models.TextChoices):
        FRONTEND = "Frontend", "Frontend"
        BACKEND  = "Backend",  "Backend"
        MOBILE   = "Mobile",   "Mobile"

    class Status(models.TextChoices):
        EM_ANDAMENTO = "Em andamento", "Em andamento"
        CONCLUIDO    = "Concluído",    "Concluído"

    codigo = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Código",
        help_text="Código único do grupo. Ex: FE-001, BE-002",
    )

    nome = models.CharField(
        max_length=100,
        verbose_name="Nome",
        help_text="Nome do grupo",
    )

    data = models.DateField(
        verbose_name="Data",
        help_text="Data de início do grupo",
    )

    periodo = models.CharField(
        max_length=20,
        choices=Periodo.choices,
        verbose_name="Período",
        help_text="Período letivo do grupo",
    )

    mvp = models.CharField(
        max_length=20,
        choices=MVP.choices,
        verbose_name="MVP",
        help_text="Tipo de MVP: Frontend, Backend ou Mobile",
    )

    github_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="GitHub URL",
        help_text="Link do repositório do grupo no GitHub",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.EM_ANDAMENTO,
        verbose_name="Status",
        help_text="Status do grupo: Em andamento ou Concluído",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em",
    )

    class Meta:
        ordering = ["-criado_em"]

    def __str__(self) -> str:
        return f"{self.codigo} — {self.nome}"

    def __repr__(self) -> str:
        return f"<Grupo: {self.codigo} - {self.status}>"
