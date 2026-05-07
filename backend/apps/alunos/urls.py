from django.urls import path

from apps.alunos.views import (
    AlunoDetailView,
    AlunoListCreateView,
    VincularGrupoView,
)

urlpatterns = [
    path("", AlunoListCreateView.as_view(), name="aluno-list-create"),
    path("<int:pk>/", AlunoDetailView.as_view(), name="aluno-detail"),
    path("<int:pk>/vincular-grupo/", VincularGrupoView.as_view(), name="aluno-vincular-grupo"),
]