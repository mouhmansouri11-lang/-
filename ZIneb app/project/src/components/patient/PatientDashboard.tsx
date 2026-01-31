import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Search,
  AlertCircle,
  FileText,
  Users,
  FlaskConical,
  Bell,
  CreditCard,
  Droplet,
  LogOut
} from 'lucide-react';
import BookAppointment from './BookAppointment';
import EmergencyButton from './EmergencyButton';
import MedicalProfile from './MedicalProfile';
import FamilyManagement from './FamilyManagement';
import LabTests from './LabTests';
import Notifications from './Notifications';
import Subscription from './Subscription';
import BloodDonation from './BloodDonation';

type Tab = 'home' | 'appointments' | 'search' | 'emergency' | 'profile' | 'family' | 'tests' | 'notifications' | 'subscription' | 'blood';

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: FileText },
    { id: 'appointments', label: 'المواعيد', icon: Calendar },
    { id: 'search', label: 'بحث عن طبيب', icon: Search },
    { id: 'emergency', label: 'طوارئ', icon: AlertCircle },
    { id: 'profile', label: 'الملف الطبي', icon: FileText },
    { id: 'family', label: 'العائلة', icon: Users },
    { id: 'tests', label: 'التحاليل', icon: FlaskConical },
    { id: 'blood', label: 'التبرع بالدم', icon: Droplet },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'subscription', label: 'الاشتراك', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-teal-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">طبيبي</h1>
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

      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <Calendar className="w-12 h-12 text-teal-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">احجز موعدًا</h3>
              <p className="text-gray-600 mb-4">ابحث عن طبيب واحجز موعدك بسهولة</p>
              <button
                onClick={() => setActiveTab('appointments')}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
              >
                احجز الآن
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <Search className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">ابحث عن طبيب</h3>
              <p className="text-gray-600 mb-4">ابحث حسب التخصص والموقع والسعر</p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                ابحث الآن
              </button>
            </div>

            <div className="bg-red-50 border-2 border-red-500 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">حالة طوارئ</h3>
              <p className="text-red-600 mb-4">في حالات الطوارئ اضغط هنا</p>
              <button
                onClick={() => setActiveTab('emergency')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full font-bold"
              >
                طوارئ
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <FileText className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">الملف الطبي</h3>
              <p className="text-gray-600 mb-4">اطلع على معلوماتك الصحية</p>
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
              >
                عرض الملف
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <Droplet className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">التبرع بالدم</h3>
              <p className="text-gray-600 mb-4">اطلب تبرعًا أو تبرع لشخص</p>
              <button
                onClick={() => setActiveTab('blood')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                إدارة التبرعات
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <FlaskConical className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">التحاليل الطبية</h3>
              <p className="text-gray-600 mb-4">اطلب تحاليل من المخابر</p>
              <button
                onClick={() => setActiveTab('tests')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                طلب تحليل
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && <BookAppointment />}
        {activeTab === 'search' && <BookAppointment />}
        {activeTab === 'emergency' && <EmergencyButton />}
        {activeTab === 'profile' && <MedicalProfile />}
        {activeTab === 'family' && <FamilyManagement />}
        {activeTab === 'tests' && <LabTests />}
        {activeTab === 'notifications' && <Notifications />}
        {activeTab === 'subscription' && <Subscription />}
        {activeTab === 'blood' && <BloodDonation />}
      </main>
    </div>
  );
}
