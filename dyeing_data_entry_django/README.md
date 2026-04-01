# 染整过程数据录入系统（Django 版）

这是一个基于你上传 Excel 模板设计的 Django 数据录入系统骨架，适用于染整过程数据采集、人工录入、Excel 导入、主数据维护和后续 AI 建模前的数据沉淀。

## 一、系统目标

围绕 Excel 中的 5 张业务表构建：

1. **批次主表**：批次级主数据
2. **化学品表**：一个批次对应多条化学品记录
3. **工艺时序表**：一个批次对应多条时序过程数据
4. **环境设备表**：一个批次对应一条环境/设备快照
5. **结果表**：一个批次对应一条结果记录

## 二、推荐页面

- 批次列表
- 新建批次
- 编辑批次
- 批次详情
- Excel 导入
- Django Admin 后台维护

## 三、技术选型

- Django 5
- SQLite（默认，可切 PostgreSQL）
- openpyxl（Excel 导入）
- Bootstrap 5（模板页面）

## 四、项目结构

```text
dyeing_data_entry_django/
├── manage.py
├── requirements.txt
├── README.md
├── dyeing_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    └── dyeing/
        ├── __init__.py
        ├── admin.py
        ├── apps.py
        ├── forms.py
        ├── models.py
        ├── services.py
        ├── urls.py
        ├── views.py
        ├── migrations/
        │   └── __init__.py
        └── templates/
            └── dyeing/
                ├── base.html
                ├── batch_list.html
                ├── batch_form.html
                ├── batch_detail.html
                └── import_form.html
```

## 五、核心数据关系

- `Batch` 是主表，`batch_id` 为主键
- `ChemicalRecord` 与 `ProcessRecord` 为多对一
- `EnvironmentRecord` 与 `ResultRecord` 为一对一

## 六、启动方式

```bash
python -m venv .venv
source .venv/bin/activate  # Windows 用 .venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

访问：
- 前台：`http://127.0.0.1:8000/`
- 后台：`http://127.0.0.1:8000/admin/`

## 七、Excel 导入说明

系统内置了基于你模板的导入逻辑，支持以下 sheet：

- 批次主表
- 化学品表
- 工艺时序表
- 环境设备表
- 结果表

导入逻辑位于：

```python
apps/dyeing/services.py
```

前台入口：
- `/import/`

## 八、后续建议增强

1. 增加用户、角色、组织、车间、班组权限
2. 增加字段级校验规则与异常报警
3. 增加批量导入日志和错误回显
4. 增加图谱/时序曲线可视化
5. 增加 API（Django REST Framework）
6. 增加 AI 建模数据导出接口

## 九、与 Excel 模板的字段映射摘要

### 批次主表
- batch_id
- order_no
- fabric_weight_gsm
- width_cm
- fiber_type
- fiber_structure
- weave_type
- pretreatment_score
- liquor_ratio
- load_amount_kg
- operator_name
- machine_id
- created_at

### 化学品表
- batch_id
- chemical_type
- chemical_name
- concentration_gpl
- measurement_method
- remark

### 工艺时序表
- batch_id
- time_min
- temperature_c
- heating_rate_cpm
- ph
- conductivity_ms_cm
- flow_rate_lpm
- dye_concentration_gpl
- dye_uptake_pct
- stirring_intensity_rpm
- dye_concentration_spectrum
- remark

### 环境设备表
- batch_id
- water_ph
- water_conductivity_us_cm
- water_hardness_mgL
- water_cod_mgL
- equipment_status
- vibration_mm_s
- equipment_temp_c
- sop_compliance
- remark

### 结果表
- batch_id
- dye_time_min
- ks_value
- reflectance_pct
- delta_e_2000
- spectrum_curve_json
- result_l
- result_a
- result_b
- rft_flag
- rework_count
- energy_steam_kg
- remark
