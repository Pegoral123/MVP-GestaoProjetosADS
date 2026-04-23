from apps.authentication.models import CustomUser
from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class IsAdmin(BasePermission):
    def has_permission(self, request: Request, view) -> bool:
        user: CustomUser = request.user
        return user.is_authenticated and user.role == "ADMIN"


class IsProfessor(BasePermission):
    def has_permission(self, request: Request, view) -> bool:
        user: CustomUser = request.user
        return user.is_authenticated and user.role == "PROFESSOR"


class IsAluno(BasePermission):
    def has_permission(self, request: Request, view) -> bool:
        user: CustomUser = request.user
        return user.is_authenticated and user.role == "ALUNO"


class IsAdminOrProfessor(BasePermission):
    def has_permission(self, request: Request, view) -> bool:
        user: CustomUser = request.user
        return user.is_authenticated and user.role in ["ADMIN", "PROFESSOR"]