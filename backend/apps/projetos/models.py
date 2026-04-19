from django.db import models


class Projeto(models.Model):
    """
    Modelo para representar um projeto no sistema de gestão.

    Armazena informações sobre projetos desenvolvidos por grupos,
    incluindo título, descrição, link do repositório e status.
    """

    STATUS_CHOICES = (
        ("ATIVO", "Ativo"),
        ("INATIVO", "Inativo"),
    )

    id = models.AutoField(
        primary_key=True,
        verbose_name="ID",
        help_text="Identificador único do projeto",
    )

    titulo = models.CharField(
        max_length=150,
        verbose_name="Título",
        help_text="Título do projeto",
    )

    descricao = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descrição",
        help_text="Descrição detalhada do projeto",
    )

    link_github = models.URLField(
        max_length=500,
        verbose_name="Link do Repositório",
        help_text="Link do repositório GitHub do projeto",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ATIVO",
        verbose_name="Status",
        help_text="Status do projeto (ativo ou inativo)",
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
        help_text="Data e hora de criação do projeto",
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em",
        help_text="Data e hora da última atualização",
    )

    class Meta:
        ordering = ["-criado_em"]

    def __str__(self) -> str:
        """Representação do projeto."""
        return str(self.titulo)

    def is_ativo(self) -> bool:
        """Verifica se o projeto está ativo."""
        return self.status == "ATIVO"

    def is_inativo(self) -> bool:
        """Verifica se o projeto está inativo."""
        return self.status == "INATIVO"
