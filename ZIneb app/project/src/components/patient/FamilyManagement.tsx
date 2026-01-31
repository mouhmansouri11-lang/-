import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Check, X } from 'lucide-react';

export default function FamilyManagement() {
  const { profile } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    const { data: accepted } = await supabase
      .from('family_members')
      .select(`
        *,
        family_profile:profiles!family_members_family_member_id_fkey(full_name, user_id_number)
      `)
      .eq('patient_id', profile?.id)
      .eq('status', 'accepted');

    const { data: pending } = await supabase
      .from('family_members')
      .select(`
        *,
        requester:profiles!family_members_patient_id_fkey(full_name, user_id_number),
        family_profile:profiles!family_members_family_member_id_fkey(full_name, user_id_number)
      `)
      .or(`patient_id.eq.${profile?.id},family_member_id.eq.${profile?.id}`)
      .eq('status', 'pending');

    if (accepted) setFamilyMembers(accepted);
    if (pending) setPendingRequests(pending);
  };

  const handleSendRequest = async () => {
    if (!newMemberId || !relationship) {
      alert('يرجى إدخال جميع البيانات');
      return;
    }

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id_number', newMemberId)
      .eq('user_type', 'patient')
      .maybeSingle();

    if (!targetProfile) {
      alert('الرقم التعريفي غير صحيح أو ليس مريضًا');
      return;
    }

    const { error } = await supabase.from('family_members').insert({
      patient_id: profile!.id,
      family_member_id: targetProfile.id,
      relationship: relationship,
      status: 'pending',
    });

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: targetProfile.id,
        title: 'طلب انضمام عائلي جديد',
        message: `${profile?.full_name} يريد إضافتك كـ ${relationship}`,
        type: 'family_request',
      });

      alert('تم إرسال الطلب بنجاح');
      setNewMemberId('');
      setRelationship('');
      fetchFamily();
    }
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('family_members')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      fetchFamily();
    }
  };

  const relationships = [
    { value: 'father', label: 'أب' },
    { value: 'mother', label: 'أم' },
    { value: 'son', label: 'ابن' },
    { value: 'daughter', label: 'ابنة' },
    { value: 'grandfather', label: 'جد' },
    { value: 'grandmother', label: 'جدة' },
  ];

  const getRelationshipLabel = (rel: string) => {
    return relationships.find(r => r.value === rel)?.label || rel;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-teal-500" />
          إضافة فرد من العائلة
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرقم التعريفي (14 رقم)
            </label>
            <input
              type="text"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              placeholder="00000000000000"
              maxLength={14}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صلة القرابة
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">اختر صلة القرابة</option>
              {relationships.map((rel) => (
                <option key={rel.value} value={rel.value}>{rel.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSendRequest}
            className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
          >
            إرسال طلب الانضمام
          </button>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">طلبات معلقة</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {request.patient_id === profile?.id ? request.family_profile?.full_name : request.requester?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getRelationshipLabel(request.relationship)}
                    </p>
                  </div>
                  {request.family_member_id === profile?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponse(request.id, 'accepted')}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, 'rejected')}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-500" />
          أفراد العائلة
        </h3>
        <div className="space-y-3">
          {familyMembers.map((member) => (
            <div key={member.id} className="bg-teal-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{member.family_profile?.full_name}</p>
                  <p className="text-sm text-gray-600">{getRelationshipLabel(member.relationship)}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {member.family_profile?.user_id_number}</p>
                </div>
              </div>
            </div>
          ))}
          {familyMembers.length === 0 && (
            <p className="text-gray-500 text-center py-8">لا يوجد أفراد عائلة مسجلين</p>
          )}
        </div>
      </div>
    </div>
  );
}
