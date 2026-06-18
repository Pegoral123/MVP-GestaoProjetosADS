from django.urls import path

from apps.entregas.views import (
    EntregaDetailView,
    EntregaListCreateView,
    EntregasPorGrupoView,
    MarcarApresentadaView,
)

urlpatterns = [
    # Listar todas as entregas e criar nova entrega
    path("", EntregaListCreateView.as_view(), name="entrega-list-create"),
    # Detalhe, atualizar e deletar entrega
    path("<int:pk>/", EntregaDetailView.as_view(), name="entrega-detail"),
    # Marcar entrega como apresentada
    path("<int:pk>/apresentar/", MarcarApresentadaView.as_view(), name="entrega-apresentar"),
    # Listar entregas por grupo
    path("grupo/<int:pk>/", EntregasPorGrupoView.as_view(), name="entrega-por-grupo"),
]
