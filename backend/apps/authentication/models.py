from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Sem roles — todos os usuários são professores/admins.
    """

    email = models.EmailField(
        max_length=254,
        unique=True,
        verbose_name="Email",
        help_text="Endereço de email único do usuário",
    )

    class Meta:
        ordering = ["-date_joined"]
       
    def __str__(self) -> str:
        """Representação do usuário."""
        return f"{self.username}"
