/*
  # Create Tabibi (طبيبي) Healthcare Application Schema

  ## Overview
  Complete database schema for a comprehensive healthcare platform connecting patients, doctors, labs, and clinics.

  ## New Tables

  ### 1. profiles
  Core user profiles with 14-digit ID system
  - `id` (uuid, FK to auth.users)
  - `user_type` (text): patient, doctor, lab, clinic
  - `user_id_number` (text): 14-digit unique ID (0-6: patient, 7: doctor, 8: lab, 9: clinic)
  - `phone` (text): Phone number for authentication
  - `full_name` (text)
  - `wilaya` (text): Province/state
  - `commune` (text): City/commune
  - `address` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)

  ### 2. patients
  Patient-specific information
  - `id` (uuid, FK to profiles)
  - `date_of_birth` (date)
  - `blood_type` (text): A+, A-, B+, B-, O+, O-, AB+, AB-
  - `chronic_diseases` (jsonb): Array of chronic conditions
  - `surgeries` (jsonb): Array of past surgeries
  - `allergies` (text[])

  ### 3. doctors
  Doctor profiles and specializations
  - `id` (uuid, FK to profiles)
  - `specialization` (text)
  - `license_number` (text)
  - `clinic_id` (uuid, nullable): If doctor belongs to a clinic
  - `session_duration` (integer): Minutes per session
  - `pricing_type` (text): fixed, variable, multi
  - `fixed_price` (numeric)
  - `price_range_min` (numeric)
  - `price_range_max` (numeric)
  - `session_types` (jsonb): Array of {type, price}

  ### 4. labs
  Laboratory information
  - `id` (uuid, FK to profiles)
  - `license_number` (text)
  - `working_hours` (jsonb)

  ### 5. clinics
  Multi-doctor clinic information
  - `id` (uuid, FK to profiles)
  - `license_number` (text)
  - `specializations` (text[])

  ### 6. doctor_schedules
  Weekly schedule for doctors
  - `id` (uuid)
  - `doctor_id` (uuid, FK to doctors)
  - `day_of_week` (integer): 0-6
  - `start_time` (time)
  - `end_time` (time)
  - `is_available` (boolean)

  ### 7. appointments
  Appointment bookings
  - `id` (uuid)
  - `patient_id` (uuid)
  - `doctor_id` (uuid)
  - `appointment_date` (date)
  - `start_time` (time)
  - `end_time` (time)
  - `status` (text): pending, confirmed, cancelled, completed
  - `session_type` (text)
  - `price` (numeric)
  - `symptoms` (text)

  ### 8. family_members
  Family connections between patients
  - `id` (uuid)
  - `patient_id` (uuid)
  - `family_member_id` (uuid)
  - `relationship` (text): father, mother, son, daughter, grandfather, grandmother
  - `status` (text): pending, accepted, rejected

  ### 9. medications
  Patient medications
  - `id` (uuid)
  - `patient_id` (uuid)
  - `medication_name` (text)
  - `dosage` (text)
  - `type` (text): permanent, temporary
  - `start_date` (date)
  - `end_date` (date, nullable)

  ### 10. lab_tests
  Available tests in labs
  - `id` (uuid)
  - `lab_id` (uuid)
  - `test_name_ar` (text)
  - `test_name_fr` (text)
  - `price` (numeric)

  ### 11. test_requests
  Test requests from patients/doctors
  - `id` (uuid)
  - `patient_id` (uuid)
  - `lab_id` (uuid)
  - `doctor_id` (uuid, nullable)
  - `requested_tests` (jsonb): Array of test IDs
  - `total_price` (numeric)
  - `status` (text): pending, accepted, rejected, completed
  - `results` (text, nullable)

  ### 12. subscriptions
  Subscription management
  - `id` (uuid)
  - `user_id` (uuid)
  - `start_date` (date)
  - `end_date` (date)
  - `months` (integer)
  - `amount` (numeric)
  - `status` (text): active, expired, cancelled

  ### 13. blood_donation_requests
  Blood donation requests
  - `id` (uuid)
  - `patient_id` (uuid)
  - `blood_type` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `wilaya` (text)
  - `message` (text)
  - `status` (text): active, fulfilled, cancelled

  ### 14. notifications
  System notifications
  - `id` (uuid)
  - `user_id` (uuid)
  - `title` (text)
  - `message` (text)
  - `type` (text)
  - `related_id` (uuid, nullable)
  - `is_read` (boolean)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Doctors can view patient records during appointments
  - Family members can view each other's records when connected
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('patient', 'doctor', 'lab', 'clinic')),
  user_id_number text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  full_name text NOT NULL,
  wilaya text,
  commune text,
  address text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date,
  blood_type text CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  chronic_diseases jsonb DEFAULT '[]'::jsonb,
  surgeries jsonb DEFAULT '[]'::jsonb,
  allergies text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text UNIQUE NOT NULL,
  clinic_id uuid REFERENCES profiles(id),
  session_duration integer DEFAULT 30,
  pricing_type text DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'variable', 'multi')),
  fixed_price numeric,
  price_range_min numeric,
  price_range_max numeric,
  session_types jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create labs table
CREATE TABLE IF NOT EXISTS labs (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  working_hours jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  specializations text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create doctor_schedules table
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  session_type text,
  price numeric NOT NULL,
  symptoms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('father', 'mother', 'son', 'daughter', 'grandfather', 'grandmother')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, family_member_id),
  CHECK (patient_id != family_member_id)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dosage text,
  type text DEFAULT 'temporary' CHECK (type IN ('permanent', 'temporary')),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create lab_tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  test_name_ar text NOT NULL,
  test_name_fr text NOT NULL,
  price numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create test_requests table
CREATE TABLE IF NOT EXISTS test_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id),
  requested_tests jsonb NOT NULL,
  total_price numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  results text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  months integer NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create blood_donation_requests table
CREATE TABLE IF NOT EXISTS blood_donation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  blood_type text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  wilaya text NOT NULL,
  message text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_number ON profiles(user_id_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_blood_donation_wilaya ON blood_donation_requests(wilaya);
CREATE INDEX IF NOT EXISTS idx_blood_donation_blood_type ON blood_donation_requests(blood_type);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view doctor profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_type = 'doctor');

CREATE POLICY "Public can view lab profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_type = 'lab');

CREATE POLICY "Public can view clinic profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_type = 'clinic');

-- RLS Policies for patients
CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can insert own data"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can view patient data during appointments"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = patients.id
      AND d.id = auth.uid()
      AND a.status IN ('confirmed', 'completed')
    )
  );

CREATE POLICY "Family members can view each other"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE (fm.patient_id = auth.uid() AND fm.family_member_id = patients.id AND fm.status = 'accepted')
      OR (fm.family_member_id = auth.uid() AND fm.patient_id = patients.id AND fm.status = 'accepted')
    )
  );

-- RLS Policies for doctors
CREATE POLICY "Doctors can view own data"
  ON doctors FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors can update own data"
  ON doctors FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can insert own data"
  ON doctors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view all doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for labs
CREATE POLICY "Labs can manage own data"
  ON labs FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view all labs"
  ON labs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for clinics
CREATE POLICY "Clinics can manage own data"
  ON clinics FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view all clinics"
  ON clinics FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for doctor_schedules
CREATE POLICY "Doctors can manage own schedules"
  ON doctor_schedules FOR ALL
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Public can view doctor schedules"
  ON doctor_schedules FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- RLS Policies for family_members
CREATE POLICY "Users can view family connections"
  ON family_members FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR family_member_id = auth.uid());

CREATE POLICY "Users can create family connections"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid() OR family_member_id = auth.uid());

CREATE POLICY "Users can update family connections"
  ON family_members FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid() OR family_member_id = auth.uid())
  WITH CHECK (patient_id = auth.uid() OR family_member_id = auth.uid());

-- RLS Policies for medications
CREATE POLICY "Patients can manage own medications"
  ON medications FOR ALL
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient medications"
  ON medications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = medications.patient_id
      AND a.doctor_id = auth.uid()
      AND a.status IN ('confirmed', 'completed')
    )
  );

-- RLS Policies for lab_tests
CREATE POLICY "Labs can manage own tests"
  ON lab_tests FOR ALL
  TO authenticated
  USING (lab_id = auth.uid())
  WITH CHECK (lab_id = auth.uid());

CREATE POLICY "Public can view lab tests"
  ON lab_tests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for test_requests
CREATE POLICY "Patients can view own test requests"
  ON test_requests FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Labs can view their test requests"
  ON test_requests FOR SELECT
  TO authenticated
  USING (lab_id = auth.uid());

CREATE POLICY "Doctors can view test requests they ordered"
  ON test_requests FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create test requests"
  ON test_requests FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can create test requests"
  ON test_requests FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Labs can update test requests"
  ON test_requests FOR UPDATE
  TO authenticated
  USING (lab_id = auth.uid())
  WITH CHECK (lab_id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for blood_donation_requests
CREATE POLICY "Users can view blood donation requests"
  ON blood_donation_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can create blood donation requests"
  ON blood_donation_requests FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own blood donation requests"
  ON blood_donation_requests FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate unique 14-digit ID
CREATE OR REPLACE FUNCTION generate_user_id(user_type_param text)
RETURNS text AS $$
DECLARE
  prefix text;
  random_part text;
  new_id text;
  id_exists boolean;
BEGIN
  -- Determine prefix based on user type
  CASE user_type_param
    WHEN 'patient' THEN prefix := floor(random() * 7)::text;
    WHEN 'doctor' THEN prefix := '7';
    WHEN 'lab' THEN prefix := '8';
    WHEN 'clinic' THEN prefix := '9';
    ELSE prefix := '0';
  END CASE;
  
  -- Generate unique ID
  LOOP
    random_part := LPAD(floor(random() * 10000000000000)::text, 13, '0');
    new_id := prefix || random_part;
    
    SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id_number = new_id) INTO id_exists;
    
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;