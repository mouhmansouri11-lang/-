import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users } from 'lucide-react';

export default function PatientList() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        patient:patients(
          id,
          profile:profiles(full_name, user_id_number, phone),
          date_of_birth,
          blood_type,
          chronic_diseases,
          allergies
        )
      `)
      .eq('doctor_id', profile?.id)
      .eq('status', 'completed');

    if (data) {
      const uniquePatients = Array.from(
        new Map(data.map(item => [item.patient?.id, item.patient])).values()
      );
      setPatients(uniquePatients);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          قائمة المرضى
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((patient: any) => (
            <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {patient.profile?.full_name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>ID: {patient.profile?.user_id_number}</p>
                <p>الهاتف: {patient.profile?.phone}</p>
                <p>زمرة الدم: {patient.blood_type || 'غير محدد'}</p>
                {patient.chronic_diseases?.length > 0 && (
                  <div className="mt-2 bg-orange-50 p-2 rounded">
                    <p className="font-medium text-orange-700">أمراض مزمنة:</p>
                    <p className="text-orange-600">{patient.chronic_diseases.join('، ')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {patients.length === 0 && (
            <div className="col-span-2 text-gray-500 text-center py-12">
              لا توجد بيانات مرضى
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
