import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Settings, Save } from 'lucide-react';

export default function DoctorSettings() {
  const { profile } = useAuth();
  const [doctorData, setDoctorData] = useState<any>(null);
  const [formData, setFormData] = useState({
    specialization: '',
    session_duration: 30,
    pricing_type: 'fixed',
    fixed_price: 0,
    price_range_min: 0,
    price_range_max: 0,
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', profile?.id)
      .maybeSingle();

    if (data) {
      setDoctorData(data);
      setFormData({
        specialization: data.specialization,
        session_duration: data.session_duration,
        pricing_type: data.pricing_type,
        fixed_price: data.fixed_price || 0,
        price_range_min: data.price_range_min || 0,
        price_range_max: data.price_range_max || 0,
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('doctors')
      .update(formData)
      .eq('id', profile!.id);

    if (!error) {
      alert('تم حفظ الإعدادات بنجاح');
      fetchDoctorData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-green-600" />
          إعدادات الطبيب
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التخصص</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدة الجلسة (بالدقائق)
            </label>
            <input
              type="number"
              value={formData.session_duration}
              onChange={(e) => setFormData({ ...formData, session_duration: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التسعير</label>
            <select
              value={formData.pricing_type}
              onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="fixed">سعر ثابت</option>
              <option value="variable">سعر متغير</option>
            </select>
          </div>

          {formData.pricing_type === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (دج)
              </label>
              <input
                type="number"
                value={formData.fixed_price}
                onChange={(e) => setFormData({ ...formData, fixed_price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {formData.pricing_type === 'variable' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الأدنى (دج)
                </label>
                <input
                  type="number"
                  value={formData.price_range_min}
                  onChange={(e) => setFormData({ ...formData, price_range_min: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الأقصى (دج)
                </label>
                <input
                  type="number"
                  value={formData.price_range_max}
                  onChange={(e) => setFormData({ ...formData, price_range_max: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
