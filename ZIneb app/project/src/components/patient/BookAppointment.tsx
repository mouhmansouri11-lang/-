import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, MapPin, DollarSign, Calendar, Clock } from 'lucide-react';

interface Doctor {
  id: string;
  specialization: string;
  pricing_type: string;
  fixed_price: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  session_duration: number;
  session_types: any;
  profile: {
    full_name: string;
    wilaya: string;
    commune: string;
  };
}

export default function BookAppointment() {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingStep, setBookingStep] = useState<'search' | 'schedule' | 'confirm'>('search');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [specialization, wilaya, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profile:profiles(full_name, wilaya, commune)
      `);

    if (!error && data) {
      setDoctors(data as any);
      setFilteredDoctors(data as any);
    }
    setLoading(false);
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (specialization) {
      filtered = filtered.filter(d =>
        d.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    if (wilaya) {
      filtered = filtered.filter(d =>
        d.profile.wilaya?.toLowerCase().includes(wilaya.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) return;

    const [hours, minutes] = appointmentTime.split(':');
    const startTime = `${hours}:${minutes}:00`;

    const endDate = new Date(`${appointmentDate}T${startTime}`);
    endDate.setMinutes(endDate.getMinutes() + selectedDoctor.session_duration);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;

    let price = selectedDoctor.fixed_price || 0;
    if (selectedDoctor.pricing_type === 'multi' && sessionType) {
      const type = selectedDoctor.session_types.find((t: any) => t.type === sessionType);
      price = type?.price || 0;
    }

    const { error } = await supabase.from('appointments').insert({
      patient_id: profile!.id,
      doctor_id: selectedDoctor.id,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      session_type: sessionType || 'consultation',
      price: price,
      symptoms: symptoms,
      status: 'pending'
    });

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: selectedDoctor.id,
        title: 'طلب موعد جديد',
        message: `لديك طلب موعد جديد من ${profile?.full_name}`,
        type: 'appointment',
      });

      alert('تم إرسال طلب الحجز بنجاح!');
      setBookingStep('search');
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAppointmentTime('');
      setSymptoms('');
    }
  };

  const getPriceDisplay = (doctor: Doctor) => {
    if (doctor.pricing_type === 'fixed') {
      return `${doctor.fixed_price} دج`;
    } else if (doctor.pricing_type === 'variable') {
      return `${doctor.price_range_min} - ${doctor.price_range_max} دج`;
    } else {
      return 'حسب نوع الجلسة';
    }
  };

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {bookingStep === 'search' && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ابحث عن طبيب</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="inline w-4 h-4 ml-2" />
                  التخصص
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="مثلاً: طب الأسنان، طب الأطفال..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 ml-2" />
                  الولاية
                </label>
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  placeholder="مثلاً: خنشلة..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={filterDoctors}
                  className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{doctor.profile.full_name}</h3>
                    <p className="text-teal-600 font-medium">{doctor.specialization}</p>
                  </div>
                  <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                    {doctor.session_duration} دقيقة
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 ml-2" />
                    {doctor.profile.wilaya} - {doctor.profile.commune}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <DollarSign className="w-4 h-4 ml-2" />
                    {getPriceDisplay(doctor)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setBookingStep('schedule');
                  }}
                  className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                >
                  احجز موعدًا
                </button>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              لا توجد نتائج. جرب معايير بحث مختلفة.
            </div>
          )}
        </>
      )}

      {bookingStep === 'schedule' && selectedDoctor && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <button
            onClick={() => setBookingStep('search')}
            className="text-teal-600 mb-4 hover:underline"
          >
            ← رجوع للبحث
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            حجز موعد مع {selectedDoctor.profile.full_name}
          </h2>
          <p className="text-gray-600 mb-6">{selectedDoctor.specialization}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 ml-2" />
                التاريخ
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 ml-2" />
                الوقت
              </label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {selectedDoctor.pricing_type === 'multi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الجلسة
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">اختر نوع الجلسة</option>
                  {selectedDoctor.session_types.map((type: any, index: number) => (
                    <option key={index} value={type.type}>
                      {type.type} - {type.price} دج
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأعراض (اختياري)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="صف الأعراض التي تعاني منها..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={handleBookAppointment}
              disabled={!appointmentDate || !appointmentTime}
              className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              تأكيد الحجز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
