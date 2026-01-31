import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, Plus, Trash2 } from 'lucide-react';

export default function Schedule() {
  const { profile } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', profile?.id)
      .order('day_of_week')
      .order('start_time');

    if (data) {
      setSchedules(data);
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase.from('doctor_schedules').insert({
      doctor_id: profile!.id,
      ...formData,
    });

    if (!error) {
      setShowForm(false);
      setFormData({ day_of_week: 0, start_time: '', end_time: '' });
      fetchSchedules();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('doctor_schedules').delete().eq('id', id);
    fetchSchedules();
  };

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-green-600" />
            الجدول الزمني
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة وقت
          </button>
        </div>

        {showForm && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اليوم</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {days.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">من</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إلى</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-bold text-gray-800">{days[schedule.day_of_week]}</p>
                <p className="text-sm text-gray-600">
                  {schedule.start_time} - {schedule.end_time}
                </p>
              </div>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {schedules.length === 0 && (
            <p className="text-gray-500 text-center py-12">لم يتم إضافة جدول زمني بعد</p>
          )}
        </div>
      </div>
    </div>
  );
}
