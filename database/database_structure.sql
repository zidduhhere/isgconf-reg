-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT auth.uid(),
  mealSlotId text NOT NULL,
  familymemberindex smallint DEFAULT '0'::smallint,
  couponedAt timestamp with time zone,
  expiresAt timestamp with time zone,
  uniqueId uuid NOT NULL DEFAULT gen_random_uuid(),
  status boolean DEFAULT true,
  CONSTRAINT coupons_pkey PRIMARY KEY (uniqueId),
  CONSTRAINT coupons_id_fkey FOREIGN KEY (id) REFERENCES public.participants(id)
);
CREATE TABLE public.exhibitor_companies (
  id uuid NOT NULL,
  company_id character varying NOT NULL UNIQUE,
  company_name character varying NOT NULL,
  phone_number character varying,
  plan character varying NOT NULL CHECK (plan::text = ANY (ARRAY['Diamond'::character varying::text, 'Platinum'::character varying::text, 'Gold'::character varying::text, 'Silver'::character varying::text])),
  lunch_allocation integer NOT NULL,
  dinner_allocation integer NOT NULL,
  lunch_used integer DEFAULT 0,
  dinner_used integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT exhibitor_companies_pkey PRIMARY KEY (id),
  CONSTRAINT exhibitor_companies_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.exhibitor_employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  employee_name character varying NOT NULL,
  employee_phone character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT exhibitor_employees_pkey PRIMARY KEY (id),
  CONSTRAINT exhibitor_employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.exhibitor_companies(id)
);
CREATE TABLE public.exhibitor_meal_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  employee_id uuid,
  mealSlotId text NOT NULL,
  meal_type character varying NOT NULL CHECK (meal_type::text = ANY (ARRAY['lunch'::character varying::text, 'dinner'::character varying::text])),
  status boolean DEFAULT true,
  claimed_at timestamp without time zone,
  expires_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  quantity integer DEFAULT 1,
  CONSTRAINT exhibitor_meal_claims_pkey PRIMARY KEY (id),
  CONSTRAINT exhibitor_meal_claims_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.exhibitor_companies(id),
  CONSTRAINT exhibitor_meal_claims_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.exhibitor_employees(id)
);
CREATE TABLE public.participants (
  id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  phoneNumber text NOT NULL UNIQUE CHECK (length("phoneNumber") = 10),
  familySize smallint DEFAULT '1'::smallint,
  isFam boolean DEFAULT false,
  name text NOT NULL DEFAULT ''::text,
  hospitalName text NOT NULL DEFAULT ''::text,
  isFaculty boolean NOT NULL DEFAULT false,
  CONSTRAINT participants_pkey PRIMARY KEY (id)
);