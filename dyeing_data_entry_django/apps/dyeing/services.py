import json
from datetime import datetime

from django.db import transaction
from openpyxl import load_workbook

from .models import Batch, ChemicalRecord, EnvironmentRecord, ProcessRecord, ResultRecord

REQUIRED_SHEETS = ["批次主表", "化学品表", "工艺时序表", "环境设备表", "结果表"]


def _normalize(value):
    if value in ("", None):
        return None
    return value




def _cell(row, index):
    return row[index] if len(row) > index else None

def _normalize_batch_id(value):
    value = _normalize(value)
    if value is None:
        return None
    return str(value).strip()


def _parse_datetime(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M"):
        try:
            return datetime.strptime(str(value), fmt)
        except ValueError:
            continue
    return None


def _parse_json(value):
    if not value:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return None


def _iter_data_rows(sheet):
    """兼容不同模板：自动跳过前导空行/说明行/表头。"""
    header_tokens = {"批次id", "批次ID", "batch_id", "batch id"}
    for row in sheet.iter_rows(min_row=1, values_only=True):
        if not row:
            continue
        batch_id = _normalize_batch_id(row[0] if len(row) > 0 else None)
        if not batch_id:
            continue
        if str(batch_id).strip().lower() in {token.lower() for token in header_tokens}:
            continue
        yield row


def _validate_sheets(workbook):
    missing = [name for name in REQUIRED_SHEETS if name not in workbook.sheetnames]
    if missing:
        raise ValueError(f"Excel缺少sheet：{', '.join(missing)}")


def import_from_excel(file_obj):
    wb = load_workbook(file_obj, data_only=True)
    _validate_sheets(wb)

    batch_sheet = wb["批次主表"]
    chemical_sheet = wb["化学品表"]
    process_sheet = wb["工艺时序表"]
    env_sheet = wb["环境设备表"]
    result_sheet = wb["结果表"]

    imported_batches = set()

    with transaction.atomic():
        for row in _iter_data_rows(batch_sheet):
            batch_id = _normalize_batch_id(row[0])
            if not batch_id:
                continue
            batch, _ = Batch.objects.update_or_create(
                batch_id=batch_id,
                defaults={
                    "order_no": _normalize(_cell(row, 1)) or "",
                    "fabric_weight_gsm": _normalize(_cell(row, 2)) or 0,
                    "width_cm": _normalize(_cell(row, 3)) or 0,
                    "fiber_type": _normalize(_cell(row, 4)) or "PET",
                    "fiber_structure": _normalize(_cell(row, 5)) or "",
                    "weave_type": _normalize(_cell(row, 6)) or "平纹",
                    "pretreatment_score": _normalize(_cell(row, 7)),
                    "liquor_ratio": _normalize(_cell(row, 8)) or 0,
                    "load_amount_kg": _normalize(_cell(row, 9)) or 0,
                    "operator_name": _normalize(_cell(row, 10)) or "",
                    "machine_id": _normalize(_cell(row, 11)) or "",
                    "created_at": _parse_datetime(_cell(row, 12)),
                },
            )
            imported_batches.add(batch.batch_id)

        if not imported_batches:
            raise ValueError("未识别到有效批次数据，请检查“批次主表”第一列是否为批次ID。")

        ChemicalRecord.objects.filter(batch_id__in=imported_batches).delete()
        ProcessRecord.objects.filter(batch_id__in=imported_batches).delete()

        for row in _iter_data_rows(chemical_sheet):
            batch_id = _normalize_batch_id(row[0])
            if batch_id not in imported_batches:
                continue
            batch = Batch.objects.get(pk=batch_id)
            ChemicalRecord.objects.create(
                batch=batch,
                chemical_type=_normalize(_cell(row, 1)) or "助剂",
                chemical_name=_normalize(_cell(row, 2)) or "",
                concentration_gpl=_normalize(_cell(row, 3)) or 0,
                measurement_method=_normalize(_cell(row, 4)) or "",
                remark=_normalize(_cell(row, 5)) or "",
            )

        for row in _iter_data_rows(process_sheet):
            batch_id = _normalize_batch_id(row[0])
            if batch_id not in imported_batches:
                continue
            batch = Batch.objects.get(pk=batch_id)
            ProcessRecord.objects.create(
                batch=batch,
                time_min=_normalize(_cell(row, 1)) or 0,
                temperature_c=_normalize(_cell(row, 2)) or 0,
                heating_rate_cpm=_normalize(_cell(row, 3)),
                ph=_normalize(_cell(row, 4)),
                conductivity_ms_cm=_normalize(_cell(row, 5)),
                flow_rate_lpm=_normalize(_cell(row, 6)),
                dye_concentration_gpl=_normalize(_cell(row, 7)),
                dye_uptake_pct=_normalize(_cell(row, 8)),
                stirring_intensity_rpm=_normalize(_cell(row, 9)),
                dye_concentration_spectrum=_parse_json(_cell(row, 10)),
                remark=_normalize(_cell(row, 11)) or "",
            )

        for row in _iter_data_rows(env_sheet):
            batch_id = _normalize_batch_id(row[0])
            if batch_id not in imported_batches:
                continue
            batch = Batch.objects.get(pk=batch_id)
            EnvironmentRecord.objects.update_or_create(
                batch=batch,
                defaults={
                    "water_ph": _normalize(_cell(row, 1)),
                    "water_conductivity_us_cm": _normalize(_cell(row, 2)),
                    "water_hardness_mgL": _normalize(_cell(row, 3)),
                    "water_cod_mgL": _normalize(_cell(row, 4)),
                    "equipment_status": _normalize(_cell(row, 5)) or "正常",
                    "vibration_mm_s": _normalize(_cell(row, 6)),
                    "equipment_temp_c": _normalize(_cell(row, 7)),
                    "sop_compliance": _normalize(_cell(row, 8)) or "",
                    "remark": _normalize(_cell(row, 9)) or "",
                },
            )

        for row in _iter_data_rows(result_sheet):
            batch_id = _normalize_batch_id(row[0])
            if batch_id not in imported_batches:
                continue
            batch = Batch.objects.get(pk=batch_id)
            ResultRecord.objects.update_or_create(
                batch=batch,
                defaults={
                    "dye_time_min": _normalize(_cell(row, 1)) or 0,
                    "ks_value": _normalize(_cell(row, 2)),
                    "reflectance_pct": _normalize(_cell(row, 3)),
                    "delta_e_2000": _normalize(_cell(row, 4)) or 0,
                    "spectrum_curve_json": _parse_json(_cell(row, 5)),
                    "result_l": _normalize(_cell(row, 6)),
                    "result_a": _normalize(_cell(row, 7)),
                    "result_b": _normalize(_cell(row, 8)),
                    "rft_flag": _normalize(_cell(row, 9)) or "否",
                    "rework_count": _normalize(_cell(row, 10)) or 0,
                    "energy_steam_kg": _normalize(_cell(row, 11)),
                    "remark": _normalize(_cell(row, 12)) or "",
                },
            )

    return {
        "batch_count": len(imported_batches),
        "chemical_count": ChemicalRecord.objects.filter(batch_id__in=imported_batches).count(),
        "process_count": ProcessRecord.objects.filter(batch_id__in=imported_batches).count(),
    }
