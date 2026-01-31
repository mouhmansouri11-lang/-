import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Droplet, Activity, Pill, Scissors } from 'lucide-react';
import type { BloodType } from '../../lib/database.types';

export default function MedicalProfile() {
  const { profile } = useAuth();
  const [patientData, setPatientData] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    blood_type: '' as BloodType | '',
    chronic_diseases: [] as string[],
    surgeries: [] as string[],
    allergies: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', profile?.id)
      .maybeSingle();

    if (patient) {
      setPatientData(patient);
      setFormData({
        date_of_birth: patient.date_of_birth || '',
        blood_type: patient.blood_type || '',
        chronic_diseases: patient.chronic_diseases || [],
        surgeries: patient.surgeries || [],
        allergies: patient.allergies || [],
      });
    }

    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', profile?.id);

    if (meds) {
      setMedications(meds);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('patients')
      .upsert({
        id: profile!.id,
        ...formData,
      });

    if (!error) {
      setEditMode(false);
      fetchData();
    }
  };

  const addItem = (field: 'chronic_diseases' | 'surgeries' | 'allergies') => {
    const value = prompt(`أضف ${field === 'chronic_diseases' ? 'مرض مزمن' : field === 'surgeries' ? 'عملية جراحية' : 'حساسية'}:`);
    if (value) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value],
      });
    }
  };

  const removeItem = (field: 'chronic_diseases' | 'surgeries' | 'allergies', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-500" />
            الملف الطبي
          </h2>
          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            {editMode ? 'حفظ' : 'تعديل'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الميلاد
            </label>
            {editMode ? (
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            ) : (
              <p className="text-gray-800">{formData.date_of_birth || 'غير محدد'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplet className="inline w-4 h-4 ml-2 text-red-500" />
              زمرة الدم
            </label>
            {editMode ? (
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value as BloodType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">اختر زمرة الدم</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-800 font-bold text-lg">
                {formData.blood_type || 'غير محدد'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="inline w-4 h-4 ml-2 text-orange-500" />
            الأمراض المزمنة
          </label>
          <div className="space-y-2">
            {formData.chronic_diseases.map((disease, index) => (
              <div key={index} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                <span className="text-gray-800">{disease}</span>
                {editMode && (
                  <button
                    onClick={() => removeItem('chronic_diseases', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={() => addItem('chronic_diseases')}
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                + إضافة مرض مزمن
              </button>
            )}
            {formData.chronic_diseases.length === 0 && !editMode && (
              <p className="text-gray-500">لا توجد أمراض مزمنة</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Scissors className="inline w-4 h-4 ml-2 text-blue-500" />
            العمليات الجراحية السابقة
          </label>
          <div className="space-y-2">
            {formData.surgeries.map((surgery, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-gray-800">{surgery}</span>
                {editMode && (
                  <button
                    onClick={() => removeItem('surgeries', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={() => addItem('surgeries')}
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                + إضافة عملية جراحية
              </button>
            )}
            {formData.surgeries.length === 0 && !editMode && (
              <p className="text-gray-500">لا توجد عمليات جراحية</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الحساسية
          </label>
          <div className="space-y-2">
            {formData.allergies.map((allergy, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <span className="text-gray-800">{allergy}</span>
                {editMode && (
                  <button
                    onClick={() => removeItem('allergies', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={() => addItem('allergies')}
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                + إضافة حساسية
              </button>
            )}
            {formData.allergies.length === 0 && !editMode && (
              <p className="text-gray-500">لا توجد حساسية</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-500" />
          الأدوية
        </h3>
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className="bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800">{med.medication_name}</h4>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    med.type === 'permanent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {med.type === 'permanent' ? 'دائم' : 'مؤقت'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {med.start_date}
                  {med.end_date && ` - ${med.end_date}`}
                </div>
              </div>
            </div>
          ))}
          {medications.length === 0 && (
            <p className="text-gray-500 text-center py-4">لا توجد أدوية مسجلة</p>
          )}
        </div>
      </div>
    </div>
  );
}
