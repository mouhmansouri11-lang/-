import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserType } from '../lib/database.types';
import { Phone, User, Stethoscope, FlaskConical, Building2 } from 'lucide-react';

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'verify' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [userType, setUserType] = useState<UserType>('patient');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+213') ? phone : `+213${phone}`;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (existingProfile) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        setError('فشل إرسال رمز التحقق');
      } else {
        setStep('verify');
      }
    } else {
      setStep('register');
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+213') ? phone : `+213${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: verificationCode,
      type: 'sms',
    });

    if (error) {
      setError('رمز التحقق غير صحيح');
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('+213') ? phone : `+213${phone}`;

    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (authError) {
      setError('فشل التسجيل');
      setLoading(false);
      return;
    }

    const { data: idData } = await supabase.rpc('generate_user_id', { user_type_param: userType });

    if (authData.session) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.session.user.id,
        user_type: userType,
        user_id_number: idData as string,
        phone: formattedPhone,
        full_name: fullName,
      });

      if (profileError) {
        setError('فشل إنشاء الملف الشخصي');
      } else {
        setStep('verify');
      }
    } else {
      setStep('verify');
    }

    setLoading(false);
  };

  const userTypes = [
    { value: 'patient', label: 'مريض', icon: User, color: 'bg-blue-500' },
    { value: 'doctor', label: 'طبيب', icon: Stethoscope, color: 'bg-green-500' },
    { value: 'lab', label: 'مخبر', icon: FlaskConical, color: 'bg-purple-500' },
    { value: 'clinic', label: 'عيادة', icon: Building2, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">طبيبي</h1>
          <p className="text-gray-600 mt-2">منصتك الصحية الشاملة</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555123456"
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">سيتم إرسال رمز التحقق عبر SMS</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'متابعة'}
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                نوع الحساب
              </label>
              <div className="grid grid-cols-2 gap-3">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUserType(type.value as UserType)}
                      className={`p-4 border-2 rounded-lg transition ${
                        userType === type.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 ${type.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 text-sm"
            >
              رجوع
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز التحقق
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                تم إرسال رمز التحقق إلى {phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 text-sm"
            >
              تغيير رقم الهاتف
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
