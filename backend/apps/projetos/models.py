from django.db import models


class Projeto(models.Model):
    """
    Representa um projeto/tema disponível para os grupos.
    Um projeto pode ser usado por vários grupos.
    """

    class Status(models.TextChoices):
        ATIVO   = "Ativo",   "Ativo"
        INATIVO = "Inativo", "Inativo"

    class MVP(models.TextChoices):
        FRONTEND = "Frontend", "Frontend"
        BACKEND  = "Backend",  "Backend"
        MOBILE   = "Mobile",   "Mobile"

    nome = models.CharField(
        max_length=150,
        verbose_name="Nome",
        help_text="Nome do projeto",
    )

    descricao = models.TextField(
        verbose_name="Descrição",
        help_text="Descrição detalhada do projeto",
    )

    mvp = models.CharField(
        max_length=20,
        choices=MVP.choices,
        verbose_name="MVP",
        help_text="Tipo de MVP: Frontend, Backend ou Mobile",
    )

    ano = models.CharField(
        max_length=4,
        verbose_name="Ano",
        help_text="Ano do projeto. Ex: 2024",
    )

    requisitos = models.TextField(
        blank=True,
        null=True,
        verbose_name="Requisitos",
        help_text="Requisitos do projeto (opcional)",
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ATIVO,
        verbose_name="Status",
        help_text="Status do projeto: Ativo ou Inativo",
    )

    grupo = models.ForeignKey(
        "grupos.Grupo",
        on_delete=models.PROTECT,
        related_name="projetos",
        verbose_name="Grupo",
        help_text="Grupo responsável pelo projeto",
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
        return f"{self.nome} ({self.status})"

    def __repr__(self) -> str:
        return f"<Projeto: {self.nome} - {self.status}>"