from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class FiberType(models.TextChoices):
    PET = "PET", "PET"
    COTTON = "Cotton", "Cotton"
    NYLON = "Nylon", "Nylon"
    PLA = "PLA", "PLA"
    PET_COTTON = "PET/Cotton", "PET/Cotton"


class WeaveType(models.TextChoices):
    PLAIN = "平纹", "平纹"
    TWILL = "斜纹", "斜纹"
    SATIN = "缎纹", "缎纹"
    KNIT = "针织", "针织"


class ChemicalType(models.TextChoices):
    DYE = "染料", "染料"
    AUXILIARY = "助剂", "助剂"


class EquipmentStatus(models.TextChoices):
    NORMAL = "正常", "正常"
    IDLE = "待机", "待机"
    MAINTENANCE = "维护", "维护"
    FAULT = "故障", "故障"


class SOPCompliance(models.TextChoices):
    HIGH = "高", "高"
    MEDIUM = "中", "中"
    LOW = "低", "低"


class RFTFlag(models.TextChoices):
    YES = "是", "是"
    NO = "否", "否"


class Batch(models.Model):
    batch_id = models.CharField("批次ID", max_length=64, primary_key=True)
    order_no = models.CharField("订单号", max_length=64, blank=True)
    fabric_weight_gsm = models.DecimalField("坯布克重(g/m²)", max_digits=10, decimal_places=2)
    width_cm = models.DecimalField("门幅(cm)", max_digits=10, decimal_places=2)
    fiber_type = models.CharField("纤维种类", max_length=32, choices=FiberType.choices)
    fiber_structure = models.CharField("纤维结构", max_length=128, blank=True)
    weave_type = models.CharField("织法", max_length=32, choices=WeaveType.choices)
    pretreatment_score = models.DecimalField(
        "前处理效果评分", max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    liquor_ratio = models.DecimalField("浴比(L/kg)", max_digits=10, decimal_places=2)
    load_amount_kg = models.DecimalField("装载量(kg)", max_digits=10, decimal_places=2)
    operator_name = models.CharField("操作员", max_length=64)
    machine_id = models.CharField("缸号", max_length=64)
    created_at = models.DateTimeField("创建时间", null=True, blank=True)

    class Meta:
        ordering = ["-created_at", "-batch_id"]
        verbose_name = "批次主表"
        verbose_name_plural = "批次主表"

    def __str__(self):
        return self.batch_id


class ChemicalRecord(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="chemicals", verbose_name="批次")
    chemical_type = models.CharField("类型", max_length=16, choices=ChemicalType.choices)
    chemical_name = models.CharField("名称", max_length=128)
    concentration_gpl = models.DecimalField("浓度(g/L)", max_digits=10, decimal_places=4)
    measurement_method = models.CharField("检测方法", max_length=128, blank=True)
    remark = models.CharField("备注", max_length=255, blank=True)

    class Meta:
        verbose_name = "化学品表"
        verbose_name_plural = "化学品表"

    def __str__(self):
        return f"{self.batch_id}-{self.chemical_name}"


class ProcessRecord(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="process_records", verbose_name="批次")
    time_min = models.IntegerField("时间(min)")
    temperature_c = models.DecimalField("温度(℃)", max_digits=8, decimal_places=2)
    heating_rate_cpm = models.DecimalField("升降温速率(℃/min)", max_digits=8, decimal_places=3, null=True, blank=True)
    ph = models.DecimalField("pH", max_digits=8, decimal_places=3, null=True, blank=True)
    conductivity_ms_cm = models.DecimalField("电导率(mS/cm)", max_digits=10, decimal_places=3, null=True, blank=True)
    flow_rate_lpm = models.DecimalField("流速(L/min)", max_digits=10, decimal_places=2, null=True, blank=True)
    dye_concentration_gpl = models.DecimalField("染料浓度(g/L)", max_digits=10, decimal_places=4, null=True, blank=True)
    dye_uptake_pct = models.DecimalField("上染率/吸尽率(%)", max_digits=8, decimal_places=3, null=True, blank=True)
    stirring_intensity_rpm = models.DecimalField("搅拌强度(rpm)", max_digits=10, decimal_places=2, null=True, blank=True)
    dye_concentration_spectrum = models.JSONField("染料浓度光谱数据(JSON)", null=True, blank=True)
    remark = models.CharField("备注", max_length=255, blank=True)

    class Meta:
        verbose_name = "工艺时序表"
        verbose_name_plural = "工艺时序表"
        unique_together = ("batch", "time_min")
        ordering = ["batch_id", "time_min"]

    def __str__(self):
        return f"{self.batch_id}-{self.time_min}min"


class EnvironmentRecord(models.Model):
    batch = models.OneToOneField(Batch, on_delete=models.CASCADE, related_name="environment", verbose_name="批次")
    water_ph = models.DecimalField("水pH", max_digits=8, decimal_places=3, null=True, blank=True)
    water_conductivity_us_cm = models.DecimalField("水电导率(μS/cm)", max_digits=10, decimal_places=3, null=True, blank=True)
    water_hardness_mgL = models.DecimalField("硬度(mg/L)", max_digits=10, decimal_places=3, null=True, blank=True)
    water_cod_mgL = models.DecimalField("COD(mg/L)", max_digits=10, decimal_places=3, null=True, blank=True)
    equipment_status = models.CharField("设备状态", max_length=16, choices=EquipmentStatus.choices)
    vibration_mm_s = models.DecimalField("振动(mm/s)", max_digits=10, decimal_places=3, null=True, blank=True)
    equipment_temp_c = models.DecimalField("设备温度(℃)", max_digits=10, decimal_places=3, null=True, blank=True)
    sop_compliance = models.CharField("SOP执行一致性", max_length=16, choices=SOPCompliance.choices, blank=True)
    remark = models.CharField("备注", max_length=255, blank=True)

    class Meta:
        verbose_name = "环境设备表"
        verbose_name_plural = "环境设备表"

    def __str__(self):
        return f"{self.batch_id}-环境设备"


class ResultRecord(models.Model):
    batch = models.OneToOneField(Batch, on_delete=models.CASCADE, related_name="result", verbose_name="批次")
    dye_time_min = models.IntegerField("染色时间(min)")
    ks_value = models.DecimalField("K/S", max_digits=10, decimal_places=4, null=True, blank=True)
    reflectance_pct = models.DecimalField("反射率(%)", max_digits=10, decimal_places=4, null=True, blank=True)
    delta_e_2000 = models.DecimalField("色差ΔE2000", max_digits=10, decimal_places=4)
    spectrum_curve_json = models.JSONField("色光谱曲线(JSON)", null=True, blank=True)
    result_l = models.DecimalField("L", max_digits=10, decimal_places=4, null=True, blank=True)
    result_a = models.DecimalField("a", max_digits=10, decimal_places=4, null=True, blank=True)
    result_b = models.DecimalField("b", max_digits=10, decimal_places=4, null=True, blank=True)
    rft_flag = models.CharField("是否一次成功", max_length=8, choices=RFTFlag.choices)
    rework_count = models.IntegerField("复修次数", default=0)
    energy_steam_kg = models.DecimalField("能耗(kg蒸汽)", max_digits=10, decimal_places=2, null=True, blank=True)
    remark = models.CharField("备注", max_length=255, blank=True)

    class Meta:
        verbose_name = "结果表"
        verbose_name_plural = "结果表"

    def __str__(self):
        return f"{self.batch_id}-结果"
