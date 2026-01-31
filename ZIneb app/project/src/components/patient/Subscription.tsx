import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CreditCard, Calendar, Check } from 'lucide-react';

export default function Subscription() {
  const { profile } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setCurrentSubscription(data);
    }
  };

  const subscriptionPlans = [
    { months: 1, price: 500, discount: 0 },
    { months: 2, price: 900, discount: 10 },
    { months: 3, price: 1300, discount: 13 },
    { months: 6, price: 2400, discount: 20 },
    { months: 12, price: 4200, discount: 30 },
  ];

  const handleSubscribe = async (months: number, price: number) => {
    if (currentSubscription) {
      const confirm = window.confirm('لديك اشتراك نشط. هل تريد تجديده؟');
      if (!confirm) return;
    }

    setLoading(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const { error } = await supabase.from('subscriptions').insert({
      user_id: profile!.id,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      months: months,
      amount: price,
      status: 'active',
    });

    if (!error) {
      alert('تم تفعيل الاشتراك بنجاح!');
      fetchSubscription();
    }

    setLoading(false);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {currentSubscription && (
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Check className="w-6 h-6" />
              اشتراك نشط
            </h2>
            <span className="bg-white text-teal-600 px-4 py-2 rounded-full font-bold">
              {currentSubscription.months} {currentSubscription.months === 1 ? 'شهر' : 'أشهر'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-teal-100 text-sm">تاريخ البداية</p>
              <p className="font-bold">{new Date(currentSubscription.start_date).toLocaleDateString('ar')}</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm">تاريخ الانتهاء</p>
              <p className="font-bold">{new Date(currentSubscription.end_date).toLocaleDateString('ar')}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-teal-400">
            <p className="text-teal-100 text-sm">الأيام المتبقية</p>
            <p className="text-3xl font-bold">{calculateDaysRemaining(currentSubscription.end_date)} يوم</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-teal-500" />
          خطط الاشتراك
        </h2>
        <p className="text-gray-600 mb-6">اختر الخطة المناسبة لك واستمتع بجميع المزايا</p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.months}
              className={`relative border-2 rounded-xl p-6 transition hover:shadow-lg ${
                plan.months === 6 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
              }`}
            >
              {plan.discount > 0 && (
                <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  خصم {plan.discount}%
                </div>
              )}

              <div className="text-center mb-4">
                <Calendar className="w-12 h-12 text-teal-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {plan.months}
                </h3>
                <p className="text-sm text-gray-600">
                  {plan.months === 1 ? 'شهر' : 'أشهر'}
                </p>
              </div>

              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-teal-600">
                  {plan.price}
                  <span className="text-sm text-gray-500"> دج</span>
                </p>
                {plan.discount > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    {Math.round(plan.price / (1 - plan.discount / 100))} دج
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan.months, plan.price)}
                disabled={loading}
                className={`w-full py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                  plan.months === 6
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {loading ? 'جاري الاشتراك...' : 'اشترك الآن'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">مزايا الاشتراك</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            حجز مواعيد غير محدود مع الأطباء
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            طلب تحاليل طبية بدون قيود
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            إدارة الملف الصحي الإلكتروني
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            زر الطوارئ المتقدم
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            نظام التبرع بالدم الذكي
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            ربط أفراد العائلة
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            إشعارات فورية لكل التحديثات
          </li>
        </ul>
      </div>
    </div>
  );
}
