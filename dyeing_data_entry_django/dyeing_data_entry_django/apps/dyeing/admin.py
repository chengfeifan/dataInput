from django.contrib import admin

from .models import Batch, ChemicalRecord, EnvironmentRecord, ProcessRecord, ResultRecord


class ChemicalInline(admin.TabularInline):
    model = ChemicalRecord
    extra = 0


class ProcessInline(admin.TabularInline):
    model = ProcessRecord
    extra = 0


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = (
        "batch_id", "order_no", "fiber_type", "weave_type",
        "machine_id", "operator_name", "created_at"
    )
    search_fields = ("batch_id", "order_no", "machine_id", "operator_name")
    list_filter = ("fiber_type", "weave_type", "machine_id")
    inlines = [ChemicalInline, ProcessInline]


@admin.register(EnvironmentRecord)
class EnvironmentRecordAdmin(admin.ModelAdmin):
    list_display = ("batch", "equipment_status", "sop_compliance", "water_ph")


@admin.register(ResultRecord)
class ResultRecordAdmin(admin.ModelAdmin):
    list_display = ("batch", "delta_e_2000", "rft_flag", "rework_count", "energy_steam_kg")
