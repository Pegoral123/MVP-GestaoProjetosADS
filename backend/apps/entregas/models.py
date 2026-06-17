from django.db import models


class Entrega(models.Model):
    """
    Representa uma entrega/apresentação de um grupo.
    As notas individuais dos alunos ficam em AlunoGrupo.
    """

    grupo = models.ForeignKey(
        "grupos.Grupo",
        on_delete=models.PROTECT,
        related_name="entregas",
        verbose_name="Grupo",
        help_text="Grupo que realizou a entrega",
    )

    data_entrega = models.DateField(
        verbose_name="Data de Entrega",
        help_text="Data que o grupo entregou o projeto",
    )

    apresentado = models.BooleanField(
        default=False,
        verbose_name="Apresentado",
        help_text="Se o grupo já apresentou o projeto",
    )

    data_apresentacao = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data de Apresentação",
        help_text="Data que o grupo apresentou o projeto",
    )

    comentario_geral = models.TextField(
        null=True,
        blank=True,
        verbose_name="Comentário Geral",
        help_text="Comentário do professor sobre a entrega",
    )

    link_apresentacao = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name="Link da Apresentação",
        help_text="Link do vídeo ou slides da apresentação",
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
        ordering = ["-data_entrega"]

    def __str__(self) -> str:
        return f"Entrega {self.grupo.nome} — {self.data_entrega}"

    def __repr__(self) -> str:
        return f"<Entrega: {self.grupo.nome} - {self.data_entrega}>"