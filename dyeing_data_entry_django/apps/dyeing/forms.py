from django import forms
from django.forms import inlineformset_factory

from .models import Batch, ChemicalRecord, EnvironmentRecord, ProcessRecord, ResultRecord


class BatchForm(forms.ModelForm):
    class Meta:
        model = Batch
        fields = [
            "batch_id",
            "order_no",
            "fabric_weight_gsm",
            "width_cm",
            "fiber_type",
            "fiber_structure",
            "weave_type",
            "pretreatment_score",
            "liquor_ratio",
            "load_amount_kg",
            "operator_name",
            "machine_id",
            "created_at",
        ]
        widgets = {
            "created_at": forms.DateTimeInput(attrs={"type": "datetime-local"}),
        }


class ChemicalForm(forms.ModelForm):
    class Meta:
        model = ChemicalRecord
        fields = [
            "chemical_type",
            "chemical_name",
            "concentration_gpl",
            "measurement_method",
            "remark",
        ]


class ProcessForm(forms.ModelForm):
    dye_concentration_spectrum = forms.JSONField(required=False, widget=forms.Textarea(attrs={"rows": 2}))

    class Meta:
        model = ProcessRecord
        fields = [
            "time_min",
            "temperature_c",
            "heating_rate_cpm",
            "ph",
            "conductivity_ms_cm",
            "flow_rate_lpm",
            "dye_concentration_gpl",
            "dye_uptake_pct",
            "stirring_intensity_rpm",
            "dye_concentration_spectrum",
            "remark",
        ]


class EnvironmentForm(forms.ModelForm):
    class Meta:
        model = EnvironmentRecord
        fields = [
            "water_ph",
            "water_conductivity_us_cm",
            "water_hardness_mgL",
            "water_cod_mgL",
            "equipment_status",
            "vibration_mm_s",
            "equipment_temp_c",
            "sop_compliance",
            "remark",
        ]


class ResultForm(forms.ModelForm):
    spectrum_curve_json = forms.JSONField(required=False, widget=forms.Textarea(attrs={"rows": 2}))

    class Meta:
        model = ResultRecord
        fields = [
            "dye_time_min",
            "ks_value",
            "reflectance_pct",
            "delta_e_2000",
            "spectrum_curve_json",
            "result_l",
            "result_a",
            "result_b",
            "rft_flag",
            "rework_count",
            "energy_steam_kg",
            "remark",
        ]


ChemicalFormSet = inlineformset_factory(
    Batch,
    ChemicalRecord,
    form=ChemicalForm,
    extra=2,
    can_delete=True,
)

ProcessFormSet = inlineformset_factory(
    Batch,
    ProcessRecord,
    form=ProcessForm,
    extra=3,
    can_delete=True,
)


class UploadExcelForm(forms.Form):
    file = forms.FileField(label="选择Excel文件")
