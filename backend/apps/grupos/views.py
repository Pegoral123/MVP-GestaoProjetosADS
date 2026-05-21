from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.alunos.serializers import AlunoSerializer
from apps.grupos.models import Grupo
from apps.grupos.serializers import (
    AtualizarGrupoSerializer,
    CriarGrupoSerializer,
    GrupoSerializer,
)
from apps.grupos.services import GrupoService