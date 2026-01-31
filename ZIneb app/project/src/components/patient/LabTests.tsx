import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FlaskConical, Search, ShoppingCart } from 'lucide-react';

export default function LabTests() {
  const { profile } = useAuth();
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchLabs();
    fetchMyRequests();
  }, []);

  const fetchLabs = async () => {
    const { data } = await supabase
      .from('labs')
      .select(`
        *,
        profile:profiles(id, full_name, wilaya, commune)
      `);

    if (data) {
      setLabs(data);
    }
  };

  const fetchLabTests = async (labId: string) => {
    const { data } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('lab_id', labId);

    if (data) {
      setAvailableTests(data);
    }
  };

  const fetchMyRequests = async () => {
    const { data } = await supabase
      .from('test_requests')
      .select(`
        *,
        lab:labs(profile:profiles(full_name))
      `)
      .eq('patient_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setMyRequests(data);
    }
  };

  const handleSelectLab = (lab: any) => {
    setSelectedLab(lab);
    fetchLabTests(lab.profile.id);
    setSelectedTests([]);
  };

  const toggleTest = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, testId) => {
      const test = availableTests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  const handleSubmitRequest = async () => {
    if (selectedTests.length === 0) {
      alert('يرجى اختيار تحليل واحد على الأقل');
      return;
    }

    const testsData = selectedTests.map(testId => {
      const test = availableTests.find(t => t.id === testId);
      return {
        id: testId,
        name_ar: test?.test_name_ar,
        name_fr: test?.test_name_fr,
        price: test?.price,
      };
    });

    const { error } = await supabase.from('test_requests').insert({
      patient_id: profile!.id,
      lab_id: selectedLab.profile.id,
      requested_tests: testsData,
      total_price: calculateTotal(),
      status: 'pending',
    });

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: selectedLab.profile.id,
        title: 'طلب تحاليل جديد',
        message: `طلب تحاليل جديد من ${profile?.full_name}`,
        type: 'test_request',
      });

      alert('تم إرسال طلب التحاليل بنجاح');
      setSelectedLab(null);
      setSelectedTests([]);
      fetchMyRequests();
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'accepted': return 'مقبول';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!selectedLab ? (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Search className="w-6 h-6 text-teal-500" />
              اختر مخبرًا
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labs.map((lab) => (
                <div
                  key={lab.id}
                  onClick={() => handleSelectLab(lab)}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-transparent hover:border-purple-500 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FlaskConical className="w-8 h-8 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">{lab.profile.full_name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{lab.profile.wilaya} - {lab.profile.commune}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">طلباتي السابقة</h3>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{request.lab?.profile?.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {request.requested_tests.length} تحليل - {request.total_price} دج
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleString('ar')}
                  </div>
                </div>
              ))}
              {myRequests.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد طلبات سابقة</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <button
            onClick={() => setSelectedLab(null)}
            className="text-teal-600 mb-4 hover:underline"
          >
            ← رجوع للمخابر
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedLab.profile.full_name}
          </h2>
          <p className="text-gray-600 mb-6">{selectedLab.profile.wilaya} - {selectedLab.profile.commune}</p>

          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-500" />
            اختر التحاليل المطلوبة
          </h3>

          <div className="space-y-2 mb-6">
            {availableTests.map((test) => (
              <div
                key={test.id}
                onClick={() => toggleTest(test.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedTests.includes(test.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{test.test_name_ar}</p>
                    <p className="text-sm text-gray-600">{test.test_name_fr}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-purple-600">{test.price} دج</p>
                    {selectedTests.includes(test.id) && (
                      <span className="text-green-600 text-sm">✓ محدد</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTests.length > 0 && (
            <div className="bg-teal-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">عدد التحاليل:</span>
                <span className="font-bold text-teal-600">{selectedTests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">المجموع الكلي:</span>
                <span className="font-bold text-teal-600 text-xl">{calculateTotal()} دج</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitRequest}
            disabled={selectedTests.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إرسال الطلب ({calculateTotal()} دج)
          </button>
        </div>
      )}
    </div>
  );
}
