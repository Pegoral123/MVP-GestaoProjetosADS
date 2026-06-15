from django.urls import path

from apps.grupos.views import (
    GrupoAlunosView,
    GrupoDetailView,
    GrupoListCreateView,
    VincularProjetoView,
)

urlpatterns = [
    path("", GrupoListCreateView.as_view(), name="grupo-list-create"),
    path("<int:pk>/", GrupoDetailView.as_view(), name="grupo-detail"),
    path("<int:pk>/alunos/", GrupoAlunosView.as_view(), name="grupo-alunos"),
    path("<int:pk>/vincular-projeto/", VincularProjetoView.as_view(), name="grupo-vincular-projeto"),
]