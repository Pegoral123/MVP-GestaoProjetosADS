from django.urls import path

from apps.projetos.views import (
    ProjetoAlterarStatusView,
    ProjetoDetailView,
    ProjetoListCreateView,
)

urlpatterns = [
    path("", ProjetoListCreateView.as_view(), name="projeto-list-create"),
    path("<int:pk>/", ProjetoDetailView.as_view(), name="projeto-detail"),
    path("<int:pk>/status/", ProjetoAlterarStatusView.as_view(), name="projeto-alterar-status"),
]