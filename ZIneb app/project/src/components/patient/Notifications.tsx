import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Bell, Check } from 'lucide-react';

export default function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile?.id)
      .eq('is_read', false);

    fetchNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-500" />
            الإشعارات
          </h2>
          <button
            onClick={markAllAsRead}
            className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            تحديد الكل كمقروء
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                notification.is_read
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-teal-50 border-2 border-teal-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                    جديد
                  </span>
                )}
              </div>
              <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-800'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notification.created_at).toLocaleString('ar')}
              </p>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-12">لا توجد إشعارات</p>
          )}
        </div>
      </div>
    </div>
  );
}
