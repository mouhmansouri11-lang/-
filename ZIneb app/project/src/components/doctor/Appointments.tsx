import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Check, X } from 'lucide-react';

export default function Appointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(
          profile:profiles(full_name, phone, user_id_number),
          date_of_birth,
          chronic_diseases,
          blood_type
        )
      `)
      .eq('doctor_id', profile?.id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;

    if (data) {
      setAppointments(data);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        await supabase.from('notifications').insert({
          user_id: appointment.patient_id,
          title: `تحديث حالة الموعد`,
          message: `تم ${status === 'confirmed' ? 'تأكيد' : status === 'cancelled' ? 'إلغاء' : 'إكمال'} موعدك`,
          type: 'appointment_update',
        });
      }
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">المواعيد</h2>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'الكل' : getStatusLabel(f)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {appointment.patient?.profile?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {appointment.patient?.profile?.user_id_number}</p>
                  <p className="text-sm text-gray-600">زمرة الدم: {appointment.patient?.blood_type || 'غير محدد'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(appointment.appointment_date).toLocaleDateString('ar')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {appointment.start_time} - {appointment.end_time}
                </div>
              </div>

              {appointment.symptoms && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">الأعراض:</p>
                  <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                </div>
              )}

              {appointment.patient?.chronic_diseases?.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">الأمراض المزمنة:</p>
                  <p className="text-sm text-gray-600">{appointment.patient.chronic_diseases.join('، ')}</p>
                </div>
              )}

              {appointment.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateStatus(appointment.id, 'confirmed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    تأكيد
                  </button>
                  <button
                    onClick={() => updateStatus(appointment.id, 'cancelled')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => updateStatus(appointment.id, 'completed')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-3"
                >
                  تحديد كمكتمل
                </button>
              )}
            </div>
          ))}

          {appointments.length === 0 && (
            <p className="text-gray-500 text-center py-12">لا توجد مواعيد</p>
          )}
        </div>
      </div>
    </div>
  );
}
