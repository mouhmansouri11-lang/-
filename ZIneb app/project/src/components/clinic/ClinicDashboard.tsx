import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Building2, UserPlus, Users, LogOut } from 'lucide-react';

export default function ClinicDashboard() {
  const { profile, signOut } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select(`
        *,
        profile:profiles(full_name, user_id_number, phone)
      `)
      .eq('clinic_id', profile?.id);

    if (data) setDoctors(data);
  };

  const handleAddDoctor = async () => {
    if (!doctorId) {
      alert('يرجى إدخال الرقم التعريفي للطبيب');
      return;
    }

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id_number', doctorId)
      .eq('user_type', 'doctor')
      .maybeSingle();

    if (!targetProfile) {
      alert('الرقم التعريفي غير صحيح أو ليس طبيبًا');
      return;
    }

    const { error } = await supabase
      .from('doctors')
      .update({ clinic_id: profile!.id })
      .eq('id', targetProfile.id);

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: targetProfile.id,
        title: 'دعوة للانضمام للعيادة',
        message: `${profile?.full_name} يريد إضافتك للعيادة`,
        type: 'clinic_invitation',
      });

      alert('تم إضافة الطبيب بنجاح');
      setDoctorId('');
      fetchDoctors();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">طبيبي - لوحة العيادة</h1>
              <p className="text-sm opacity-90">{profile?.full_name}</p>
              <p className="text-xs opacity-75">ID: {profile?.user_id_number}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-orange-600" />
              إضافة طبيب
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرقم التعريفي للطبيب (14 رقم)
                </label>
                <input
                  type="text"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="70000000000000"
                  maxLength={14}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleAddDoctor}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition"
              >
                إضافة الطبيب
              </button>
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-orange-800 mb-2">معلومات</h3>
              <p className="text-sm text-orange-700">
                يمكنك إضافة أطباء للعيادة عن طريق إدخال رقمهم التعريفي. سيتلقى الطبيب إشعارًا بالدعوة.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-600" />
              الأطباء في العيادة ({doctors.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {doctor.profile?.full_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>التخصص: {doctor.specialization}</p>
                    <p>ID: {doctor.profile?.user_id_number}</p>
                    <p>الهاتف: {doctor.profile?.phone}</p>
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="font-medium text-orange-700">
                        مدة الجلسة: {doctor.session_duration} دقيقة
                      </p>
                      <p className="font-medium text-orange-700">
                        السعر: {doctor.fixed_price ? `${doctor.fixed_price} دج` : 'متغير'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {doctors.length === 0 && (
                <div className="col-span-2 text-gray-500 text-center py-12">
                  لم يتم إضافة أطباء بعد
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
