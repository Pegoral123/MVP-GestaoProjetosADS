from django.urls import path

from apps.alunos.views import (
    AlunoDetailView,
    AlunoListCreateView,
    DesvincularGrupoView,
    LancarNotaView,
    VincularGrupoView,
)

urlpatterns = [
    path("", AlunoListCreateView.as_view(), name="aluno-list-create"),
    path("<int:pk>/", AlunoDetailView.as_view(), name="aluno-detail"),
    path("<int:pk>/vincular-grupo/", VincularGrupoView.as_view(), name="aluno-vincular-grupo"),
    path("<int:pk>/desvincular-grupo/", DesvincularGrupoView.as_view(), name="aluno-desvincular-grupo"),
    path("<int:pk>/lancar-nota/", LancarNotaView.as_view(), name="aluno-lancar-nota"),
]