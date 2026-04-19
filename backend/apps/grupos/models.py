from django.db import models


class Grupo(models.Model):
    """
    Modelo para representar um grupo de projeto no sistema de gestão.

    Armazena informações sobre grupos de alunos que trabalham
    juntos em projetos.
    """

    id = models.AutoField(
        primary_key=True,
        verbose_name="ID",
        help_text="Identificador único do grupo",
    )

    nome = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nome",
        help_text="Nome do grupo do Grupo",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
        help_text="Data e hora de criação do grupo",
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em",
        help_text="Data e hora da última atualização",
    )

    class Meta:
        ordering = ["nome"]
        
    def __str__(self) -> str:
        """Representação do grupo."""
        return str(self.nome)

