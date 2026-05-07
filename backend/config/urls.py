from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── Apps do projeto ────────────────────────────────────────────
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/alunos/", include("apps.alunos.urls")),

    # ── Swagger ────────────────────────────────────────────────────
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

# http://127.0.0.1:8000/api/schema/swagger-ui/