from django.db import models


class Entrega(models.Model):
    """
    Modelo para representar uma entrega de projeto no sistema.

    Armazena informações sobre entregas de projetos, incluindo
    descrição, data de entrega, status de apresentação e
    link da apresentação.
    """

    id = models.AutoField(
        primary_key=True,
        verbose_name="ID",
        help_text="Identificador único da entrega",
    )

    descricao = models.TextField(
        verbose_name="Descrição",
        help_text="Descrição detalhada da entrega",
    )

    data_entrega = models.DateTimeField(
        verbose_name="Data de Entrega",
        help_text="Data e hora da entrega do projeto",
    )

    apresentado = models.BooleanField(
        default=False,
        verbose_name="Apresentado",
        help_text="Define se o projeto foi apresentado",
    )

    link_apresentacao = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Link da Apresentação",
        help_text="Link da apresentação do projeto",
    )

    projeto = models.ForeignKey(
        "projetos.Projeto",
        on_delete=models.PROTECT,
        related_name="entregas",
        verbose_name="Projeto",
        help_text="Projeto relacionado à entrega",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
        help_text="Data e hora de criação do registro",
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em",
        help_text="Data e hora da última atualização",
    )

    class Meta:
        ordering = ["-data_entrega"]
        indexes = [
            models.Index(fields=["projeto"]),
            models.Index(fields=["-data_entrega"]),
        ]

    def foi_apresentada(self) -> bool:
        """Verifica se a entrega foi apresentada."""
        return self.apresentado

    def nao_foi_apresentada(self) -> bool:
        """Verifica se a entrega ainda não foi apresentada."""
        return not self.apresentado
