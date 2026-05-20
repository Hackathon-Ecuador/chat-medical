import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const identifyPatient = tool({
  description:
    'Identifica al paciente por su cédula (DNI) y devuelve su plan de seguro. Llámala APENAS el paciente entregue su cédula, ANTES de preguntar síntomas.',
  inputSchema: z.object({
    dni: z.string().describe('Cédula del paciente (DNI). Acepta solo dígitos.'),
  }),
  execute: async ({ dni }) => {
    try {
      const supabase = await createClient();
      const cleaned = dni.replace(/\D/g, '');

      const { data: patient, error } = await supabase
        .from('patients')
        .select(`
          id,
          full_name,
          dni,
          plan_id,
          insurance_plans (id, name, description)
        `)
        .eq('dni', cleaned)
        .single();

      if (error || !patient) {
        return {
          success: true,
          found: false,
          instruction_to_llm:
            'No encontré al paciente con esa cédula. Pídele que la verifique o indícale que se registre. NO continúes con síntomas hasta que esté identificado.',
        };
      }

      if (!patient.insurance_plans) {
        return {
          success: true,
          found: true,
          patient_name: patient.full_name,
          plan: null,
          instruction_to_llm: `Paciente ${patient.full_name} no tiene plan asociado. Infórmale y detén el flujo de copago.`,
        };
      }

      return {
        success: true,
        found: true,
        patient_name: patient.full_name,
        plan: patient.insurance_plans,
        instruction_to_llm: `Paciente identificado: ${patient.full_name}, plan "${(patient.insurance_plans as any).name}". Guarda el plan_id para el cálculo posterior. Saluda por su nombre y pregunta sus síntomas.`,
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error al identificar paciente' };
    }
  },
});

export const inferSpecialtyBySymptom = tool({
  description:
    'Mapea el síntoma del paciente a una especialidad médica oficial. Llámala SOLO después de identificar al paciente.',
  inputSchema: z.object({
    symptomDescription: z.string().describe('Descripción o nombre del síntoma reportado por el paciente.'),
  }),
  execute: async ({ symptomDescription }) => {
    try {
      const supabase = await createClient();

      const { data: symptoms, error } = await supabase
        .from('symptoms')
        .select(`
          id,
          symptom_name,
          specialty_id,
          specialties (id, name, description)
        `);

      if (error) throw error;

      const normalizedInput = symptomDescription.toLowerCase();
      const matchedSymptom = symptoms?.find(
        (s) =>
          normalizedInput.includes(s.symptom_name.toLowerCase()) ||
          s.symptom_name.toLowerCase().includes(normalizedInput),
      );

      if (matchedSymptom && matchedSymptom.specialties) {
        return {
          success: true,
          found: true,
          specialty: matchedSymptom.specialties,
          instruction_to_llm: `Especialidad detectada: "${(matchedSymptom.specialties as any).name}". Confírmala con el paciente y procede directo a calcular el copago.`,
        };
      }

      const { data: allSpecialties } = await supabase
        .from('specialties')
        .select('id, name, description');
      return {
        success: true,
        found: false,
        available_specialties: allSpecialties,
        instruction_to_llm:
          'No hubo match exacto. Elige la especialidad más lógica de la lista o pide más detalles del síntoma.',
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error al validar especialidad' };
    }
  },
});

export const calculateCoverageAndOptions = tool({
  description:
    'Cruza plan + especialidad + ciudad para calcular copagos exactos y rankear hospitales. Si en la ciudad pedida no hay opciones, devuelve las de otras ciudades con flag in_other_city=true.',
  inputSchema: z.object({
    planId: z.string().uuid().describe('ID del plan obtenido por identifyPatient.'),
    specialtyId: z.string().uuid().describe('ID de la especialidad obtenida por inferSpecialtyBySymptom.'),
    city: z
      .string()
      .describe('Ciudad donde el paciente quiere atenderse, e.g. "Quito" o "Guayaquil".'),
    includeOtherCities: z
      .boolean()
      .optional()
      .describe(
        'true SOLO cuando el paciente ya confirmó que quiere ver opciones de otras ciudades porque su ciudad no tenía cobertura.',
      ),
  }),
  execute: async ({ planId, specialtyId, city, includeOtherCities }) => {
    try {
      const supabase = await createClient();

      const { data: copayRules, error: copayError } = await supabase
        .from('copay_rules')
        .select('network_level, copay_amount')
        .eq('plan_id', planId)
        .eq('specialty_id', specialtyId);

      if (copayError) throw copayError;

      const copayMap = new Map<number, number>();
      copayRules?.forEach((rule) =>
        copayMap.set(rule.network_level, Number(rule.copay_amount)),
      );

      const { data: hospitalOptions, error: hospError } = await supabase
        .from('hospital_specialties')
        .select(`
          base_price,
          hospitals (id, name, address, city, network_level)
        `)
        .eq('specialty_id', specialtyId);

      if (hospError) throw hospError;

      const allOptions =
        hospitalOptions?.map((item: any) => {
          const hospital = item.hospitals;
          const netLevel = hospital.network_level;
          const exactCopay = copayMap.has(netLevel)
            ? copayMap.get(netLevel)!
            : Number(item.base_price);

          return {
            hospital_id: hospital.id,
            hospital_name: hospital.name,
            address: hospital.address,
            city: hospital.city,
            network_level: netLevel,
            base_price: Number(item.base_price),
            patient_copay: exactCopay,
            savings: Math.max(0, Number(item.base_price) - exactCopay),
          };
        }) || [];

      const normalizedCity = city.trim().toLowerCase();
      const inCity = allOptions.filter(
        (o) => (o.city || '').toLowerCase() === normalizedCity,
      );
      const otherCities = allOptions.filter(
        (o) => (o.city || '').toLowerCase() !== normalizedCity,
      );

      inCity.sort((a, b) => a.patient_copay - b.patient_copay);
      otherCities.sort((a, b) => a.patient_copay - b.patient_copay);

      // Caso A: hay opciones en la ciudad pedida → mostrar normal
      if (inCity.length > 0) {
        return {
          success: true,
          requested_city: city,
          in_city_options: inCity,
          instruction_to_llm: `Hay ${inCity.length} hospital(es) en ${city}. Presenta TODAS las opciones dentro de un bloque ---. Resalta el de menor patient_copay como recomendado. NO menciones hospitales de otras ciudades a menos que el paciente lo pida después.`,
        };
      }

      // Caso B: no hay en la ciudad, pero sí en otra ciudad
      if (otherCities.length > 0) {
        if (includeOtherCities) {
          return {
            success: true,
            requested_city: city,
            in_city_options: [],
            other_city_options: otherCities,
            instruction_to_llm: `El paciente aceptó ver otras ciudades. Presenta las opciones dentro de un bloque ---, indicando claramente la ciudad de cada hospital. Resalta el de menor patient_copay como recomendado y aclara que requiere viaje a otra ciudad.`,
          };
        }

        const otherCityNames = Array.from(new Set(otherCities.map((o) => o.city)));
        return {
          success: true,
          requested_city: city,
          in_city_options: [],
          has_options_in_other_cities: true,
          available_other_cities: otherCityNames,
          instruction_to_llm: `NO hay hospitales con esa especialidad en ${city}. SÍ hay opciones en: ${otherCityNames.join(', ')}. Avísale al paciente con empatía y PREGÚNTALE si quiere ver esas opciones aunque queden en otra ciudad. NO muestres aún los hospitales — espera su confirmación y vuelve a llamar esta tool con includeOtherCities=true.`,
        };
      }

      // Caso C: no hay en ninguna ciudad
      return {
        success: true,
        requested_city: city,
        in_city_options: [],
        instruction_to_llm: `No hay NINGÚN hospital con esa especialidad en la red (${city} ni otras ciudades). Discúlpate y sugiere consultar con la aseguradora.`,
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error en el cálculo' };
    }
  },
});
