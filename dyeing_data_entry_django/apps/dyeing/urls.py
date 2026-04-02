from django.urls import path

from . import views

app_name = "dyeing"

urlpatterns = [
    path("", views.batch_list, name="batch_list"),
    path("batch/add/", views.batch_create, name="batch_create"),
    path("batch/<str:pk>/", views.batch_detail, name="batch_detail"),
    path("batch/<str:pk>/edit/", views.batch_update, name="batch_update"),
    path("import/", views.excel_import_view, name="excel_import"),
    path("vue-entry/", views.vue_entry_view, name="vue_entry"),
    path("api/import/json/", views.api_import_json_view, name="api_import_json"),
    path("api/import/excel/", views.api_import_excel_view, name="api_import_excel"),
]
