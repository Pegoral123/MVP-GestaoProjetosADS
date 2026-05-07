from django.db import models


class Aluno(models.Model):
    """
    Modelo para representar um aluno no sistema de gestão de projetos.

    Armazena informações básicas do aluno, incluindo nome, email, matrícula
    e associação com um grupo de projeto.
    """

    id = models.AutoField(
        primary_key=True,
        verbose_name="ID",
        help_text="Identificador único do aluno",
    )

    nome = models.CharField(
        max_length=100,
        verbose_name=("Nome Completo"),
        help_text=("Nome completo do aluno"),
    )

    email = models.EmailField(
        max_length=150,
        unique=True,
        verbose_name="Email",
        help_text="Endereço de email único do aluno",
    )

    celular = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        verbose_name="Celular",
        help_text="Número de celular do aluno (opcional)",
    )

    matricula = models.CharField(
        max_length=8,
        unique=True,
        verbose_name="Matrícula",
        help_text="Número de matrícula único do aluno",
    )

    grupo = models.ForeignKey(
        "grupos.Grupo",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alunos",
        verbose_name="Grupo",
        help_text="Grupo ao qual o aluno pertence",
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
        ordering = ["nome"]

    def __str__(self) -> str:
        """Representação do aluno."""
        return f"{self.nome} ({self.matricula})"
