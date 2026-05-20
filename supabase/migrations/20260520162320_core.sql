-- Tablas independientes (Padres)
CREATE TABLE public.hospitals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text,
  network_level integer NOT NULL CHECK (network_level >= 1 AND network_level <= 3),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hospitals_pkey PRIMARY KEY (id)
);

CREATE TABLE public.insurance_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT insurance_plans_pkey PRIMARY KEY (id)
);

CREATE TABLE public.specialties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT specialties_pkey PRIMARY KEY (id)
);

-- Tablas dependientes (Hijas)
CREATE TABLE public.copay_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid,
  specialty_id uuid,
  network_level integer NOT NULL CHECK (network_level >= 1 AND network_level <= 3),
  copay_amount numeric NOT NULL,
  CONSTRAINT copay_rules_pkey PRIMARY KEY (id),
  CONSTRAINT copay_rules_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.insurance_plans(id),
  CONSTRAINT copay_rules_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id)
);

CREATE TABLE public.hospital_specialties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospital_id uuid,
  specialty_id uuid,
  base_price numeric NOT NULL,
  CONSTRAINT hospital_specialties_pkey PRIMARY KEY (id),
  CONSTRAINT hospital_specialties_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT hospital_specialties_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id)
);

CREATE TABLE public.patients (
  id text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE,
  plan_id uuid,
  dni text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.insurance_plans(id)  
);
CREATE UNIQUE INDEX patients_dni_unique ON public.patients (dni);


CREATE TABLE public.symptoms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  symptom_name text NOT NULL UNIQUE,
  specialty_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT symptoms_pkey PRIMARY KEY (id),
  CONSTRAINT symptoms_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id)
);