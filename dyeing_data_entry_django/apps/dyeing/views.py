import json

from django.contrib import messages
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .forms import (
    BatchForm,
    ChemicalFormSet,
    EnvironmentForm,
    ProcessFormSet,
    ResultForm,
    UploadExcelForm,
)
from .models import Batch
from .services import import_from_excel, import_from_json_payload


def batch_list(request):
    batches = Batch.objects.all()
    return render(request, "dyeing/batch_list.html", {"batches": batches})


def batch_detail(request, pk):
    batch = get_object_or_404(Batch, pk=pk)
    return render(request, "dyeing/batch_detail.html", {"batch": batch})


def batch_create(request):
    if request.method == "POST":
        form = BatchForm(request.POST)
        batch = form.instance
        env_form = EnvironmentForm(request.POST, prefix="env")
        result_form = ResultForm(request.POST, prefix="result")
        chemical_formset = ChemicalFormSet(request.POST, instance=batch, prefix="chemical")
        process_formset = ProcessFormSet(request.POST, instance=batch, prefix="process")

        if all([
            form.is_valid(),
            env_form.is_valid(),
            result_form.is_valid(),
            chemical_formset.is_valid(),
            process_formset.is_valid(),
        ]):
            with transaction.atomic():
                batch = form.save()
                chemical_formset.instance = batch
                process_formset.instance = batch
                chemical_formset.save()
                process_formset.save()

                env = env_form.save(commit=False)
                env.batch = batch
                env.save()

                result = result_form.save(commit=False)
                result.batch = batch
                result.save()

            messages.success(request, "批次创建成功")
            return redirect("dyeing:batch_detail", pk=batch.pk)
    else:
        form = BatchForm()
        env_form = EnvironmentForm(prefix="env")
        result_form = ResultForm(prefix="result")
        chemical_formset = ChemicalFormSet(prefix="chemical")
        process_formset = ProcessFormSet(prefix="process")

    return render(
        request,
        "dyeing/batch_form.html",
        {
            "form": form,
            "env_form": env_form,
            "result_form": result_form,
            "chemical_formset": chemical_formset,
            "process_formset": process_formset,
            "page_title": "新建批次",
        },
    )


def batch_update(request, pk):
    batch = get_object_or_404(Batch, pk=pk)
    env_instance = getattr(batch, "environment", None)
    result_instance = getattr(batch, "result", None)

    if request.method == "POST":
        form = BatchForm(request.POST, instance=batch)
        env_form = EnvironmentForm(request.POST, instance=env_instance, prefix="env")
        result_form = ResultForm(request.POST, instance=result_instance, prefix="result")
        chemical_formset = ChemicalFormSet(request.POST, instance=batch, prefix="chemical")
        process_formset = ProcessFormSet(request.POST, instance=batch, prefix="process")
        if all([
            form.is_valid(),
            env_form.is_valid(),
            result_form.is_valid(),
            chemical_formset.is_valid(),
            process_formset.is_valid(),
        ]):
            with transaction.atomic():
                batch = form.save()
                chemical_formset.save()
                process_formset.save()

                env = env_form.save(commit=False)
                env.batch = batch
                env.save()

                result = result_form.save(commit=False)
                result.batch = batch
                result.save()

            messages.success(request, "批次更新成功")
            return redirect("dyeing:batch_detail", pk=batch.pk)
    else:
        form = BatchForm(instance=batch)
        env_form = EnvironmentForm(instance=env_instance, prefix="env")
        result_form = ResultForm(instance=result_instance, prefix="result")
        chemical_formset = ChemicalFormSet(instance=batch, prefix="chemical")
        process_formset = ProcessFormSet(instance=batch, prefix="process")

    return render(
        request,
        "dyeing/batch_form.html",
        {
            "form": form,
            "env_form": env_form,
            "result_form": result_form,
            "chemical_formset": chemical_formset,
            "process_formset": process_formset,
            "page_title": f"编辑批次：{batch.batch_id}",
        },
    )


def excel_import_view(request):
    if request.method == "POST":
        form = UploadExcelForm(request.POST, request.FILES)
        if form.is_valid():
            result = import_from_excel(form.cleaned_data["file"])
            messages.success(
                request,
                f"导入成功：批次 {result['batch_count']} 条，化学品 {result['chemical_count']} 条，时序 {result['process_count']} 条。"
            )
            return redirect(reverse("dyeing:batch_list"))
    else:
        form = UploadExcelForm()

    return render(request, "dyeing/import_form.html", {"form": form})


def vue_entry_view(request):
    return render(request, "dyeing/vue_entry.html")


@require_POST
def api_import_json_view(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "JSON 格式不正确"}, status=400)

    try:
        result = import_from_json_payload(payload)
        return JsonResponse({"ok": True, "result": result})
    except ValueError as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@require_POST
def api_import_excel_view(request):
    file_obj = request.FILES.get("file")
    if not file_obj:
        return JsonResponse({"ok": False, "error": "请上传 Excel 文件"}, status=400)

    result = import_from_excel(file_obj)
    return JsonResponse({"ok": True, "result": result})
