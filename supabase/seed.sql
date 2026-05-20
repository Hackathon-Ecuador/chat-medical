-- ============================================================
-- SEED DE DEMO — Hackathon "Estimador Agéntico de Copago"
-- Idempotente: usa ON CONFLICT para poder re-correrlo sin romper.
-- ============================================================

-- ── PLANES DE SEGURO ────────────────────────────────────────
INSERT INTO public.insurance_plans (name, description) VALUES
  ('Plan Platinum Corp', 'Plan corporativo premium. Copagos bajos y cobertura preferente en red nivel 1.'),
  ('Plan Básico Salud',  'Plan individual estándar. Mejores precios en red nivel 2 y 3.')
ON CONFLICT (name) DO NOTHING;

-- ── ESPECIALIDADES ──────────────────────────────────────────
INSERT INTO public.specialties (name, description) VALUES
  ('Gastroenterología', 'Trastornos del sistema digestivo.'),
  ('Cardiología',       'Corazón y sistema circulatorio.'),
  ('Dermatología',      'Piel y anexos cutáneos.'),
  ('Traumatología',     'Lesiones musculoesqueléticas y huesos.'),
  ('Pediatría',         'Atención médica de niños y adolescentes.')
ON CONFLICT (name) DO NOTHING;

-- ── HOSPITALES (con ciudad) ─────────────────────────────────
INSERT INTO public.hospitals (name, address, city, network_level) VALUES
  ('Hospital Metropolitano',     'Av. Mariana de Jesús s/n',         'Quito',     1),
  ('Hospital Vozandes',          'Villalengua Oe2-37',               'Quito',     1),
  ('Clínica Pasteur',            'Av. Eloy Alfaro N29-235',          'Quito',     2),
  ('Hospital IESS Quito Sur',    'Av. Moran Valverde',               'Quito',     3),
  ('Hospital Alcívar',           'Coronel 2301 y Azuay',             'Guayaquil', 1),
  ('Clínica Kennedy',            'Av. del Periodista',               'Guayaquil', 2),
  ('Clínica San Francisco',      'Av. Mariscal Sucre 802',           'Guayaquil', 2),
  ('Hospital IESS Sur Guayaquil','Av. 25 de Julio',                  'Guayaquil', 3)
ON CONFLICT (name) DO UPDATE SET
  city          = EXCLUDED.city,
  address       = EXCLUDED.address,
  network_level = EXCLUDED.network_level;

-- ── SÍNTOMAS → ESPECIALIDAD ────────────────────────────────
INSERT INTO public.symptoms (symptom_name, specialty_id) VALUES
  ('dolor de estómago',  (SELECT id FROM public.specialties WHERE name='Gastroenterología')),
  ('acidez',             (SELECT id FROM public.specialties WHERE name='Gastroenterología')),
  ('náuseas',            (SELECT id FROM public.specialties WHERE name='Gastroenterología')),
  ('diarrea',            (SELECT id FROM public.specialties WHERE name='Gastroenterología')),
  ('dolor en el pecho',  (SELECT id FROM public.specialties WHERE name='Cardiología')),
  ('palpitaciones',      (SELECT id FROM public.specialties WHERE name='Cardiología')),
  ('presión alta',       (SELECT id FROM public.specialties WHERE name='Cardiología')),
  ('manchas en la piel', (SELECT id FROM public.specialties WHERE name='Dermatología')),
  ('comezón',            (SELECT id FROM public.specialties WHERE name='Dermatología')),
  ('acné',               (SELECT id FROM public.specialties WHERE name='Dermatología')),
  ('dolor de rodilla',   (SELECT id FROM public.specialties WHERE name='Traumatología')),
  ('fractura',           (SELECT id FROM public.specialties WHERE name='Traumatología')),
  ('esguince',           (SELECT id FROM public.specialties WHERE name='Traumatología')),
  ('fiebre en niño',     (SELECT id FROM public.specialties WHERE name='Pediatría')),
  ('tos del bebé',       (SELECT id FROM public.specialties WHERE name='Pediatría'))
ON CONFLICT (symptom_name) DO NOTHING;

-- ── HOSPITAL × ESPECIALIDAD × PRECIO BASE ───────────────────
-- ⚠ Cardiología SOLO existe en hospitales de Quito.
--   Esto habilita la demo "no hay esa especialidad en tu ciudad, ¿quieres ver Quito?"
DELETE FROM public.hospital_specialties;

INSERT INTO public.hospital_specialties (hospital_id, specialty_id, base_price)
SELECT h.id, s.id, p.base_price
FROM (VALUES
  -- ── Quito (Cardiología incluida) ──
  ('Hospital Metropolitano',     'Gastroenterología', 120.00),
  ('Hospital Metropolitano',     'Cardiología',       180.00),
  ('Hospital Metropolitano',     'Dermatología',      110.00),
  ('Hospital Metropolitano',     'Traumatología',     150.00),
  ('Hospital Metropolitano',     'Pediatría',         100.00),

  ('Hospital Vozandes',          'Gastroenterología', 115.00),
  ('Hospital Vozandes',          'Cardiología',       175.00),
  ('Hospital Vozandes',          'Dermatología',      105.00),
  ('Hospital Vozandes',          'Traumatología',     145.00),
  ('Hospital Vozandes',          'Pediatría',          95.00),

  ('Clínica Pasteur',            'Gastroenterología',  90.00),
  ('Clínica Pasteur',            'Cardiología',       140.00),
  ('Clínica Pasteur',            'Dermatología',       85.00),
  ('Clínica Pasteur',            'Traumatología',     120.00),
  ('Clínica Pasteur',            'Pediatría',          80.00),

  ('Hospital IESS Quito Sur',    'Gastroenterología',  60.00),
  ('Hospital IESS Quito Sur',    'Cardiología',        95.00),
  ('Hospital IESS Quito Sur',    'Dermatología',       55.00),
  ('Hospital IESS Quito Sur',    'Traumatología',      80.00),
  ('Hospital IESS Quito Sur',    'Pediatría',          50.00),

  -- ── Guayaquil (sin Cardiología) ──
  ('Hospital Alcívar',           'Gastroenterología', 125.00),
  ('Hospital Alcívar',           'Dermatología',      115.00),
  ('Hospital Alcívar',           'Traumatología',     155.00),
  ('Hospital Alcívar',           'Pediatría',         105.00),

  ('Clínica Kennedy',            'Gastroenterología',  95.00),
  ('Clínica Kennedy',            'Dermatología',       90.00),
  ('Clínica Kennedy',            'Traumatología',     125.00),
  ('Clínica Kennedy',            'Pediatría',          85.00),

  ('Clínica San Francisco',      'Gastroenterología',  95.00),
  ('Clínica San Francisco',      'Dermatología',       90.00),
  ('Clínica San Francisco',      'Traumatología',     125.00),
  ('Clínica San Francisco',      'Pediatría',          85.00),

  ('Hospital IESS Sur Guayaquil','Gastroenterología',  60.00),
  ('Hospital IESS Sur Guayaquil','Dermatología',       55.00),
  ('Hospital IESS Sur Guayaquil','Traumatología',      80.00),
  ('Hospital IESS Sur Guayaquil','Pediatría',          50.00)
) AS p(hospital_name, specialty_name, base_price)
JOIN public.hospitals  h ON h.name = p.hospital_name
JOIN public.specialties s ON s.name = p.specialty_name;

-- ── COPAY RULES (plan × especialidad × nivel de red) ────────
-- Platinum: copagos bajos en nivel 1.
-- Básico:   copagos bajos en nivel 2-3.
DELETE FROM public.copay_rules;

INSERT INTO public.copay_rules (plan_id, specialty_id, network_level, copay_amount)
SELECT pl.id, sp.id, r.network_level, r.copay_amount
FROM (VALUES
  -- ── Plan Platinum Corp ──
  ('Plan Platinum Corp', 'Gastroenterología', 1,  20.00),
  ('Plan Platinum Corp', 'Gastroenterología', 2,  45.00),
  ('Plan Platinum Corp', 'Gastroenterología', 3,  30.00),
  ('Plan Platinum Corp', 'Cardiología',       1,  30.00),
  ('Plan Platinum Corp', 'Cardiología',       2,  60.00),
  ('Plan Platinum Corp', 'Cardiología',       3,  40.00),
  ('Plan Platinum Corp', 'Dermatología',      1,  18.00),
  ('Plan Platinum Corp', 'Dermatología',      2,  40.00),
  ('Plan Platinum Corp', 'Dermatología',      3,  25.00),
  ('Plan Platinum Corp', 'Traumatología',     1,  25.00),
  ('Plan Platinum Corp', 'Traumatología',     2,  55.00),
  ('Plan Platinum Corp', 'Traumatología',     3,  35.00),
  ('Plan Platinum Corp', 'Pediatría',         1,  15.00),
  ('Plan Platinum Corp', 'Pediatría',         2,  35.00),
  ('Plan Platinum Corp', 'Pediatría',         3,  20.00),

  -- ── Plan Básico Salud ──
  ('Plan Básico Salud',  'Gastroenterología', 1,  70.00),
  ('Plan Básico Salud',  'Gastroenterología', 2,  35.00),
  ('Plan Básico Salud',  'Gastroenterología', 3,  15.00),
  ('Plan Básico Salud',  'Cardiología',       1, 110.00),
  ('Plan Básico Salud',  'Cardiología',       2,  55.00),
  ('Plan Básico Salud',  'Cardiología',       3,  25.00),
  ('Plan Básico Salud',  'Dermatología',      1,  65.00),
  ('Plan Básico Salud',  'Dermatología',      2,  30.00),
  ('Plan Básico Salud',  'Dermatología',      3,  12.00),
  ('Plan Básico Salud',  'Traumatología',     1,  90.00),
  ('Plan Básico Salud',  'Traumatología',     2,  45.00),
  ('Plan Básico Salud',  'Traumatología',     3,  20.00),
  ('Plan Básico Salud',  'Pediatría',         1,  60.00),
  ('Plan Básico Salud',  'Pediatría',         2,  28.00),
  ('Plan Básico Salud',  'Pediatría',         3,  10.00)
) AS r(plan_name, specialty_name, network_level, copay_amount)
JOIN public.insurance_plans pl ON pl.name = r.plan_name
JOIN public.specialties    sp ON sp.name = r.specialty_name;

-- ── PACIENTES DE PRUEBA ─────────────────────────────────────
INSERT INTO public.patients (id, full_name, email, dni, plan_id) VALUES
  ('p-maria',  'María Pérez',   'maria@demo.ec',   '0102030405',
     (SELECT id FROM public.insurance_plans WHERE name='Plan Platinum Corp')),
  ('p-carlos', 'Carlos Loor',   'carlos@demo.ec',  '0606060606',
     (SELECT id FROM public.insurance_plans WHERE name='Plan Básico Salud')),
  ('p-ana',    'Ana Villacís',  'ana@demo.ec',     '0900090009',
     (SELECT id FROM public.insurance_plans WHERE name='Plan Platinum Corp'))
ON CONFLICT (id) DO UPDATE SET
  dni     = EXCLUDED.dni,
  plan_id = EXCLUDED.plan_id;
