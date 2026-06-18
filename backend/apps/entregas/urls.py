from django.urls import path

from apps.entregas.views import (
    EntregaDetailView,
    EntregaListCreateView,
    EntregasPorGrupoView,
    MarcarApresentadaView,
)

urlpatterns = [
   
    path("", EntregaListCreateView.as_view(), name="entrega-list-create"),
    path("<int:pk>/", EntregaDetailView.as_view(), name="entrega-detail"),
    path("<int:pk>/apresentar/", MarcarApresentadaView.as_view(), name="entrega-apresentar"),
    path("grupo/<int:pk>/", EntregasPorGrupoView.as_view(), name="entrega-por-grupo"),
]
