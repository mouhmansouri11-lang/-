import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, MapPin, Phone } from 'lucide-react';

export default function EmergencyButton() {
  const { profile } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('id', profile?.id)
      .maybeSingle();

    if (data) {
      setPatientData(data);
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const handleEmergency = async () => {
    setLoading(true);

    try {
      const loc: any = await getLocation();
      setLocation(loc);

      const chronicDiseases = patientData?.chronic_diseases || [];
      const diseaseText = chronicDiseases.length > 0
        ? chronicDiseases.join('، ')
        : 'لا توجد أمراض مزمنة';

      const emergencyMessage = `
مرحبًا، أنا ${profile?.full_name}.
أبلغ من العمر ${calculateAge(patientData?.date_of_birth)} سنة.
أعاني من حالة صحية حرجة ولا أستطيع التحدث.
أنا متواجد في ${profile?.wilaya}، ${profile?.commune}.
العنوان: ${profile?.address || 'غير محدد'}.
الإحداثيات: ${loc.lat}, ${loc.lng}.
لدي أمراض مزمنة: ${diseaseText}.
أحتاج لمساعدة عاجلة.
      `.trim();

      const smsMessage = encodeURIComponent(emergencyMessage);

      const { data: familyData } = await supabase
        .from('family_members')
        .select('family_member_id')
        .eq('patient_id', profile?.id)
        .eq('status', 'accepted');

      if (familyData && familyData.length > 0) {
        for (const family of familyData) {
          await supabase.from('notifications').insert({
            user_id: family.family_member_id,
            title: '🚨 حالة طوارئ',
            message: `${profile?.full_name} في حالة طوارئ! الموقع: ${profile?.wilaya}`,
            type: 'emergency',
          });
        }
      }

      window.location.href = `tel:14`;

      alert(`تم تجهيز رسالة الطوارئ. سيتم الاتصال بـ 14 الآن.`);
    } catch (error) {
      alert('فشل تحديد الموقع. يرجى التأكد من تفعيل GPS.');
    }

    setLoading(false);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'غير محدد';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border-4 border-red-500 rounded-2xl p-8 text-center">
        <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />

        <h2 className="text-3xl font-bold text-red-800 mb-4">
          زر الطوارئ
        </h2>

        <p className="text-red-600 mb-6">
          عند الضغط على هذا الزر، سيتم:
        </p>

        <ul className="text-right text-red-700 mb-8 space-y-2 max-w-md mx-auto">
          <li className="flex items-start gap-2">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
            <span>تحديد موقعك الجغرافي بدقة</span>
          </li>
          <li className="flex items-start gap-2">
            <Phone className="w-5 h-5 flex-shrink-0 mt-1" />
            <span>الاتصال التلقائي برقم الحماية المدنية (14)</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <span>إرسال إشعارات لأفراد عائلتك</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <span>مشاركة معلوماتك الطبية</span>
          </li>
        </ul>

        <button
          onClick={handleEmergency}
          disabled={loading}
          className="bg-red-600 text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-red-700 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {loading ? 'جاري المعالجة...' : 'اضغط في حالة الطوارئ'}
        </button>

        {location && (
          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">تم تحديد الموقع:</p>
            <p className="text-xs text-gray-500 font-mono">{location.lat}, {location.lng}</p>
          </div>
        )}

        <p className="text-xs text-red-500 mt-6">
          استخدم هذا الزر في حالات الطوارئ الحقيقية فقط
        </p>
      </div>
    </div>
  );
}
