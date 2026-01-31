export type UserType = 'patient' | 'doctor' | 'lab' | 'clinic';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type FamilyRelationship = 'father' | 'mother' | 'son' | 'daughter' | 'grandfather' | 'grandmother';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type PricingType = 'fixed' | 'variable' | 'multi';
export type MedicationType = 'permanent' | 'temporary';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type DonationStatus = 'active' | 'fulfilled' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: UserType;
          user_id_number: string;
          phone: string;
          full_name: string;
          wilaya: string | null;
          commune: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: UserType;
          user_id_number: string;
          phone: string;
          full_name: string;
          wilaya?: string | null;
          commune?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          user_type?: UserType;
          full_name?: string;
          wilaya?: string | null;
          commune?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
      };
      patients: {
        Row: {
          id: string;
          date_of_birth: string | null;
          blood_type: BloodType | null;
          chronic_diseases: any;
          surgeries: any;
          allergies: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          date_of_birth?: string | null;
          blood_type?: BloodType | null;
          chronic_diseases?: any;
          surgeries?: any;
          allergies?: string[];
        };
        Update: {
          date_of_birth?: string | null;
          blood_type?: BloodType | null;
          chronic_diseases?: any;
          surgeries?: any;
          allergies?: string[];
        };
      };
      doctors: {
        Row: {
          id: string;
          specialization: string;
          license_number: string;
          clinic_id: string | null;
          session_duration: number;
          pricing_type: PricingType;
          fixed_price: number | null;
          price_range_min: number | null;
          price_range_max: number | null;
          session_types: any;
          created_at: string;
        };
        Insert: {
          id: string;
          specialization: string;
          license_number: string;
          clinic_id?: string | null;
          session_duration?: number;
          pricing_type?: PricingType;
          fixed_price?: number | null;
          price_range_min?: number | null;
          price_range_max?: number | null;
          session_types?: any;
        };
        Update: {
          specialization?: string;
          license_number?: string;
          clinic_id?: string | null;
          session_duration?: number;
          pricing_type?: PricingType;
          fixed_price?: number | null;
          price_range_min?: number | null;
          price_range_max?: number | null;
          session_types?: any;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          session_type: string | null;
          price: number;
          symptoms: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          session_type?: string | null;
          price: number;
          symptoms?: string | null;
        };
        Update: {
          status?: AppointmentStatus;
          symptoms?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          type: string;
          related_id?: string | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
}
