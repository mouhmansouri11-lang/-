import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Users, Settings, LogOut, Bell } from 'lucide-react';
import Appointments from './Appointments';
import Schedule from './Schedule';
import PatientList from './PatientList';
import DoctorSettings from './DoctorSettings';
import Notifications from '../patient/Notifications';

type Tab = 'appointments' | 'schedule' | 'patients' | 'settings' | 'notifications';

export default function DoctorDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('appointments');

  const tabs = [
    { id: 'appointments', label: 'المواعيد', icon: Calendar },
    { id: 'schedule', label: 'الجدول الزمني', icon: Clock },
    { id: 'patients', label: 'المرضى', icon: Users },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">طبيبي - لوحة الطبيب</h1>
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
                      ? 'bg-green-600 text-white'
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
        {activeTab === 'appointments' && <Appointments />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'patients' && <PatientList />}
        {activeTab === 'settings' && <DoctorSettings />}
        {activeTab === 'notifications' && <Notifications />}
      </main>
    </div>
  );
}
