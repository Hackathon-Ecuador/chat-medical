-- Agrega ciudad al hospital. Permite que el agente filtre opciones por la
-- ciudad donde el paciente quiere atenderse y derive a otra ciudad cuando
-- la especialidad no exista en la red local.

ALTER TABLE public.hospitals
  ADD COLUMN city text;

CREATE INDEX hospitals_city_idx ON public.hospitals (city);
