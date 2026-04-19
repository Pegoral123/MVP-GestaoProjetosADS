from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Modelo de usuário customizado que estende AbstractUser do Django.

    Gerencia autenticação e informações de perfil dos usuários no sistema,
    incluindo papéis/funções (admin, professor, aluno).
    """

    ROLE_CHOICES = (
        ("ADMIN", "Administrador"),
        ("PROFESSOR", "Professor"),
        ("ALUNO", "Aluno"),
    )

    email = models.EmailField(
        max_length=254,
        unique=True,
        verbose_name="Email",
        help_text="Endereço de email único do usuário",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="ALUNO",
        verbose_name="Papel",
        help_text="Papel/função do usuário no sistema",
    )

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["username"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self) -> str:
        """Representação do usuário."""
        return f"{self.get_full_name()} ({self.username})"

    def is_admin(self) -> bool:
        """Verifica se o usuário tem papel de administrador."""
        return self.role == "ADMIN"

    def is_professor(self) -> bool:
        """Verifica se o usuário tem papel de professor."""
        return self.role == "PROFESSOR"

    def is_aluno_role(self) -> bool:
        """Verifica se o usuário tem papel de aluno."""
        return self.role == "ALUNO"
