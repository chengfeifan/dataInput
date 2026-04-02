import React, { useState, useRef, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Activity, Droplets, FlaskConical, Settings2, FileText, BarChart3, FileJson, FileSpreadsheet, XCircle, Download, LogOut, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

const initialUsers = [
  { id: '1', username: 'admin', password: '123', role: 'admin', name: '系统管理员' },
  { id: '2', username: 'op1', password: '123', role: 'operator', name: '张三' },
];

const formSections = [
  {
    id: 'basic',
    title: '基础信息',
    icon: FileText,
    fields: [
      { id: 'batch_id', label: '批次ID', type: 'text', required: true, placeholder: 'B20260324001', note: '主键，跨表唯一' },
      { id: 'operator_name', label: '操作员', type: 'text', required: true, placeholder: 'OP_张三', note: '姓名/工号' },
      { id: 'machine_id', label: '缸号', type: 'text', required: true, placeholder: 'JET-03', note: '机台编号' },
      { id: 'equipment_status', label: '设备状态', type: 'select', required: true, options: ['正常', '维护', '故障', '待机'], note: '维护/故障/待机等' },
    ]
  },
  {
    id: 'fabric',
    title: '织物信息',
    icon: Settings2,
    fields: [
      { id: 'fabric_weight_gsm', label: '坯布克重', type: 'number', unit: 'g/m²', required: true, placeholder: '185' },
      { id: 'width_cm', label: '门幅', type: 'number', unit: 'cm', required: true, placeholder: '165' },
      { id: 'fiber_type', label: '纤维种类', type: 'select', required: true, options: ['PET', 'Cotton', 'Nylon', 'PLA', 'Blend'], note: '如 PET/Cotton/Nylon/PLA' },
      { id: 'fiber_structure', label: '纤维结构', type: 'text', required: false, placeholder: '长丝针织' },
      { id: 'weave_type', label: '织法', type: 'select', required: true, options: ['平纹', '斜纹', '缎纹', '针织'], note: '见枚举值' },
    ]
  },
  {
    id: 'process',
    title: '工艺参数',
    icon: Activity,
    fields: [
      { id: 'liquor_ratio', label: '浴比', type: 'number', unit: 'L/kg', required: true, placeholder: '8' },
      { id: 'load_amount_kg', label: '装载量', type: 'number', unit: 'kg', required: true, placeholder: '250' },
      { id: 'time_min', label: '时间', type: 'number', unit: 'min', required: true, placeholder: '0', note: '从染色开始计时' },
      { id: 'temperature_c', label: '温度', type: 'number', unit: '℃', required: true, placeholder: '30' },
      { id: 'heating_rate_cpm', label: '升降温速率', type: 'number', unit: '℃/min', required: false, placeholder: '2.50' },
      { id: 'dye_time_min', label: '染色时间', type: 'number', unit: 'min', required: true, placeholder: '60' },
      { id: 'stirring_intensity_rpm', label: '搅拌强度', type: 'number', unit: 'rpm', required: false, placeholder: '48' },
      { id: 'flow_rate_lpm', label: '流速', type: 'number', unit: 'L/min', required: false, placeholder: '120' },
    ]
  },
  {
    id: 'chemical',
    title: '化学品信息',
    icon: FlaskConical,
    fields: [
      { id: 'chemical_type', label: '化学品类型', type: 'select', required: true, options: ['染料', '助剂', '酸', '碱', '盐'], note: '染料/助剂' },
      { id: 'chemical_name', label: '名称', type: 'text', required: true, placeholder: '分散蓝56' },
      { id: 'concentration_gpl', label: '浓度', type: 'number', unit: 'g/L', required: true, placeholder: '1.80' },
    ]
  },
  {
    id: 'environment',
    title: '水质与环境',
    icon: Droplets,
    fields: [
      { id: 'ph', label: 'pH', type: 'number', required: false, placeholder: '5.20' },
      { id: 'conductivity_ms_cm', label: '电导率', type: 'number', unit: 'mS/cm', required: false, placeholder: '3.80' },
      { id: 'water_ph', label: '水质pH', type: 'number', required: false, placeholder: '7.30' },
      { id: 'water_conductivity_us_cm', label: '水电导率', type: 'number', unit: 'μS/cm', required: false, placeholder: '285' },
      { id: 'water_hardness_mgL', label: '硬度', type: 'number', unit: 'mg/L', required: false, placeholder: '42' },
      { id: 'water_cod_mgL', label: 'COD', type: 'number', unit: 'mg/L', required: false, placeholder: '18' },
      { id: 'vibration_mm_s', label: '振动', type: 'number', unit: 'mm/s', required: false, placeholder: '1.20' },
      { id: 'equipment_temp_c', label: '设备温度', type: 'number', unit: '℃', required: false, placeholder: '41.50' },
    ]
  },
  {
    id: 'results',
    title: '检测与结果',
    icon: BarChart3,
    fields: [
      { id: 'measurement_method', label: '检测方法', type: 'text', required: false, placeholder: 'UV-Vis 吸光度法' },
      { id: 'dye_uptake_pct', label: '上染率/吸尽率', type: 'number', unit: '%', required: false, placeholder: '63.50' },
      { id: 'sop_compliance', label: 'SOP执行一致性', type: 'select', required: false, options: ['高', '中', '低'] },
      { id: 'ks_value', label: 'K/S', type: 'number', required: false, placeholder: '14.80' },
      { id: 'reflectance_pct', label: '织物表面反射率', type: 'number', unit: '%', required: false, placeholder: '22.60' },
      { id: 'delta_e_2000', label: '色差ΔE2000', type: 'number', required: true, placeholder: '0.68' },
      { id: 'rft_flag', label: '是否一次成功', type: 'select', required: true, options: ['是', '否'] },
      { id: 'result_L', label: 'L值', type: 'number', required: true, placeholder: '22.00' },
      { id: 'result_a', label: 'a值', type: 'number', required: true, placeholder: '0.5' },
      { id: 'result_b', label: 'b值', type: 'number', required: true, placeholder: '0.5' },
      { id: 'dye_concentration_spectr', label: '染料浓度光谱数据', type: 'textarea', required: false, placeholder: '{"400":0.12, "420":0.15}', note: 'JSON格式', fullWidth: true },
      { id: 'spectrum_curve_json', label: '色光谱曲线', type: 'textarea', required: false, placeholder: '{"400":0.12, "420":0.15}', note: 'JSON格式', fullWidth: true },
    ]
  }
];

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'form' | 'users'>('form');

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && !formData.operator_name) {
      setFormData(prev => ({ ...prev, operator_name: currentUser.name }));
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const generateTemplateData = () => {
    const template: Record<string, any> = {};
    formSections.forEach(section => {
      section.fields.forEach(field => {
        template[field.id] = field.placeholder || (field.type === 'number' ? 0 : '');
      });
    });
    return template;
  };

  const downloadExcelTemplate = () => {
    const data = [generateTemplateData()];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "印染工艺数据录入模板.xlsx");
    showToast('Excel模板下载成功', 'success');
  };

  const downloadJsonTemplate = () => {
    const data = generateTemplateData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "印染工艺数据录入模板.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON模板下载成功', 'success');
  };

  const validateData = (data: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    formSections.forEach(section => {
      section.fields.forEach(field => {
        const value = data[field.id];
        if (field.required && (value === undefined || value === null || value === '')) {
          newErrors[field.id] = '此项为必填项';
        } else if (value !== undefined && value !== null && value !== '') {
          if (field.type === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
              newErrors[field.id] = '必须为有效数字';
            } else {
              if ((field.id === 'ph' || field.id === 'water_ph') && (num < 0 || num > 14)) {
                newErrors[field.id] = 'pH值应在0-14之间';
              }
              if (field.unit === '%' && (num < 0 || num > 100)) {
                newErrors[field.id] = '百分比应在0-100之间';
              }
            }
          }
          if (field.note === 'JSON格式') {
            try {
              if (typeof value === 'string') JSON.parse(value);
            } catch (e) {
              newErrors[field.id] = '必须为有效的JSON格式';
            }
          }
        }
      });
    });
    return newErrors;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'excel' | 'json') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let parsedData: Record<string, any> = {};
        
        if (type === 'json') {
          const text = evt.target?.result as string;
          parsedData = JSON.parse(text);
        } else if (type === 'excel') {
          const buffer = evt.target?.result as ArrayBuffer;
          const wb = XLSX.read(buffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          if (data.length > 0) {
            parsedData = data[0] as Record<string, any>;
          } else {
            throw new Error('Excel文件为空');
          }
        }
        
        setFormData(prev => {
          const newData = { ...prev, ...parsedData };
          const validationErrors = validateData(newData);
          setErrors(validationErrors);
          
          if (Object.keys(validationErrors).length > 0) {
            showToast(`导入成功，但有 ${Object.keys(validationErrors).length} 个字段验证未通过`, 'error');
          } else {
            showToast(`成功导入 ${Object.keys(parsedData).length} 个字段`, 'success');
          }
          return newData;
        });
      } catch (error) {
        console.error(error);
        showToast('导入失败，请检查文件格式', 'error');
      }
    };

    if (type === 'json') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
    
    e.target.value = '';
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast(`表单验证失败，请检查 ${Object.keys(validationErrors).length} 个标红字段`, 'error');
      
      // Scroll to first error
      const firstErrorId = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Form Data Submitted:', formData);
      setIsSubmitting(false);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 1000);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} showToast={showToast} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <div className="bg-blue-600 p-2 rounded-lg mr-3">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">印染工艺系统</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setCurrentView('form')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentView === 'form' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <FileText className="w-5 h-5 mr-3" />
            数据录入
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setCurrentView('users')}
              className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentView === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Users className="w-5 h-5 mr-3" />
              用户管理
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? '管理员' : '操作员'}</p>
              </div>
            </div>
            <button
              onClick={() => { setCurrentUser(null); setCurrentView('form'); }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Mobile + Actions) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center md:hidden">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">印染系统</h1>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentView === 'form' ? '数据录入' : '用户管理'}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={excelInputRef}
              onChange={(e) => handleFileUpload(e, 'excel')}
            />
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={jsonInputRef}
              onChange={(e) => handleFileUpload(e, 'json')}
            />

            {currentView === 'form' && (
              <>
                <button
                  type="button"
                  onClick={downloadJsonTemplate}
                  className="hidden sm:flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm shadow-sm"
                  title="下载JSON模板"
                >
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> JSON模板
                </button>
                
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="hidden sm:flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm shadow-sm"
                  title="下载Excel模板"
                >
                  <Download className="w-4 h-4 mr-2 text-green-600" /> Excel模板
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
                
                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm shadow-sm"
                  title="导入 JSON"
                >
                  <FileJson className="w-4 h-4 sm:mr-2 text-blue-600" /> <span className="hidden sm:inline">导入 JSON</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => excelInputRef.current?.click()}
                  className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm shadow-sm"
                  title="导入 Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 sm:mr-2 text-green-600" /> <span className="hidden sm:inline">导入 Excel</span>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {submitStatus === 'success' && (
                  <span className="hidden sm:flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 保存成功
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 sm:mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">保存中...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">保存数据</span>
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Mobile Logout */}
            <div className="md:hidden flex items-center ml-2">
              <button
                onClick={() => { setCurrentUser(null); setCurrentView('form'); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('form')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${currentView === 'form' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            数据录入
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setCurrentView('users')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${currentView === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              用户管理
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'form' ? (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
              <form id="data-entry-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
          {formSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id} className={field.fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          {field.type === 'select' ? (
                            <select
                              id={field.id}
                              required={field.required}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`block w-full rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-1 sm:text-sm border bg-white ${errors[field.id] ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'}`}
                            >
                              <option value="" disabled>请选择</option>
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              id={field.id}
                              required={field.required}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              rows={3}
                              className={`block w-full rounded-md py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm border font-mono text-xs ${errors[field.id] ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'}`}
                            />
                          ) : (
                            <div className="flex rounded-md shadow-sm">
                              <input
                                type={field.type}
                                id={field.id}
                                required={field.required}
                                placeholder={field.placeholder}
                                value={formData[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                className={`block w-full rounded-md py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm border ${field.unit ? 'rounded-r-none border-r-0' : ''} ${errors[field.id] ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'}`}
                              />
                              {field.unit && (
                                <span className={`inline-flex items-center rounded-r-md border border-l-0 px-3 sm:text-sm whitespace-nowrap ${errors[field.id] ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                                  {field.unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {errors[field.id] ? (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="w-3 h-3" />
                            {errors[field.id]}
                          </p>
                        ) : field.note ? (
                          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {field.note}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
              </form>
            </div>
          ) : (
            <UserManagement users={users} setUsers={setUsers} showToast={showToast} />
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
