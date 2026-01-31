import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FlaskConical, Plus, Bell, LogOut, Check, X } from 'lucide-react';

export default function LabDashboard() {
  const { profile, signOut } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    test_name_ar: '',
    test_name_fr: '',
    price: 0,
    description: '',
  });

  useEffect(() => {
    fetchTests();
    fetchRequests();
  }, []);

  const fetchTests = async () => {
    const { data } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('lab_id', profile?.id);

    if (data) setTests(data);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('test_requests')
      .select(`
        *,
        patient:patients(profile:profiles(full_name, phone))
      `)
      .eq('lab_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
  };

  const handleAddTest = async () => {
    const { error } = await supabase.from('lab_tests').insert({
      lab_id: profile!.id,
      ...formData,
    });

    if (!error) {
      setShowAddForm(false);
      setFormData({ test_name_ar: '', test_name_fr: '', price: 0, description: '' });
      fetchTests();
    }
  };

  const handleRequestResponse = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('test_requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.patient_id,
          title: 'تحديث طلب التحاليل',
          message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} طلب التحاليل الخاص بك`,
          type: 'test_request_update',
        });
      }
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">طبيبي - لوحة المخبر</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-purple-600" />
                التحاليل المتوفرة
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            {showAddForm && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="اسم التحليل بالعربية"
                    value={formData.test_name_ar}
                    onChange={(e) => setFormData({ ...formData, test_name_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="اسم التحليل بالفرنسية"
                    value={formData.test_name_fr}
                    onChange={(e) => setFormData({ ...formData, test_name_fr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="السعر (دج)"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="الوصف (اختياري)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTest}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tests.map((test) => (
                <div key={test.id} className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{test.test_name_ar}</h4>
                      <p className="text-sm text-gray-600">{test.test_name_fr}</p>
                    </div>
                    <p className="font-bold text-purple-600">{test.price} دج</p>
                  </div>
                </div>
              ))}

              {tests.length === 0 && (
                <p className="text-gray-500 text-center py-8">لم يتم إضافة تحاليل بعد</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-600" />
              طلبات التحاليل
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {request.patient?.profile?.full_name}
                      </h4>
                      <p className="text-sm text-gray-600">{request.patient?.profile?.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status === 'pending' ? 'قيد الانتظار' : request.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">التحاليل المطلوبة:</p>
                    {request.requested_tests.map((test: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{test.name_ar}</span>
                        <span>{test.price} دج</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2">
                      <div className="flex justify-between font-bold text-purple-600">
                        <span>المجموع:</span>
                        <span>{request.total_price} دج</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestResponse(request.id, 'accepted')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        قبول
                      </button>
                      <button
                        onClick={() => handleRequestResponse(request.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        رفض
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {requests.length === 0 && (
                <p className="text-gray-500 text-center py-12">لا توجد طلبات</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
