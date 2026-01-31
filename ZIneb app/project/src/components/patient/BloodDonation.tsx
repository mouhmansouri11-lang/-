import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, MapPin, AlertCircle } from 'lucide-react';

export default function BloodDonation() {
  const { profile } = useAuth();
  const [bloodType, setBloodType] = useState('');
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('blood_donation_requests')
      .select(`
        *,
        patient:patients(
          profile:profiles(full_name, phone)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setRequests(data);
    }
  };

  const handleRequestBlood = async () => {
    if (!bloodType) {
      alert('يرجى تحديد زمرة الدم');
      return;
    }

    setLoading(true);

    try {
      const loc: any = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
            (error) => reject(error)
          );
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });

      const { error } = await supabase.from('blood_donation_requests').insert({
        patient_id: profile!.id,
        blood_type: bloodType,
        latitude: loc.lat,
        longitude: loc.lng,
        wilaya: profile?.wilaya || '',
        message: message,
        status: 'active',
      });

      if (!error) {
        const { data: matchingPatients } = await supabase
          .from('patients')
          .select('id, profile:profiles(wilaya, latitude, longitude)')
          .eq('blood_type', bloodType);

        if (matchingPatients) {
          for (const patient of matchingPatients) {
            if (patient.id !== profile!.id) {
              const distance = calculateDistance(
                loc.lat,
                loc.lng,
                patient.profile.latitude,
                patient.profile.longitude
              );

              if (distance <= 10 && patient.profile.wilaya === profile?.wilaya) {
                await supabase.from('notifications').insert({
                  user_id: patient.id,
                  title: '🩸 طلب تبرع بالدم',
                  message: `شخص في منطقتك يحتاج لزمرة دم ${bloodType}`,
                  type: 'blood_donation',
                });
              }
            }
          }
        }

        alert('تم إرسال طلب التبرع بنجاح! سيتم إشعار المتبرعين المحتملين.');
        setMessage('');
        fetchRequests();
      }
    } catch (error) {
      alert('فشل تحديد الموقع. يرجى التأكد من تفعيل GPS.');
    }

    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-2 border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
          <Droplet className="w-6 h-6" />
          طلب تبرع بالدم
        </h2>

        <p className="text-red-700 mb-4">
          عند طلب التبرع، سيتم إرسال إشعار لجميع أصحاب زمرة الدم المطلوبة المتواجدين في دائرة 10 كم في ولايتك.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              زمرة الدم المطلوبة
            </label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">اختر زمرة الدم</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة إضافية (اختياري)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أضف أي معلومات إضافية..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleRequestBlood}
            disabled={loading || !bloodType}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-bold"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال طلب التبرع'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          طلبات التبرع النشطة
        </h3>

        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border-r-4 border-red-500 bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-red-600" />
                    زمرة الدم: {request.blood_type}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {request.wilaya}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleDateString('ar')}
                </span>
              </div>
              {request.message && (
                <p className="text-gray-700 text-sm mt-2">{request.message}</p>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-gray-500 text-center py-8">لا توجد طلبات تبرع نشطة حاليًا</p>
          )}
        </div>
      </div>
    </div>
  );
}
