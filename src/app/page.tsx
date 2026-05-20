import ChatView from "@/modules/chat/medical-chat.view";

const TEST_PATIENTS = [
  { dni: "0102030405", name: "María Pérez",  plan: "Plan Platinum Corp" },
  { dni: "0606060606", name: "Carlos Loor",  plan: "Plan Básico Salud" },
  { dni: "0900090009", name: "Ana Villacís", plan: "Plan Platinum Corp" },
];

const SAMPLE_SYMPTOMS = [
  "dolor de estómago",
  "dolor en el pecho",
  "manchas en la piel",
  "dolor de rodilla",
  "fiebre en niño",
];

export default function Home() {
  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">
      {/* Panel de instrucciones para la demo */}
      <aside className="hidden lg:flex w-[340px] shrink-0 flex-col gap-5 border-r border-[#D8D8D5] bg-white p-6 sticky top-0 h-screen overflow-y-auto">
        <div>
          <span className="inline-block rounded-full bg-[#EBF4EF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#2C6E49]">
            Demo · Hackathon
          </span>
          <h1 className="mt-3 text-[18px] font-bold leading-tight text-[#1A1A18]">
            Estimador Agéntico de Copago
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B6B68]">
            El agente identifica al paciente por cédula, detecta la especialidad
            según síntomas y calcula el copago exacto cruzando plan + hospital.
          </p>
        </div>

        <div className="rounded-xl border border-[#D8D8D5] p-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
            Cómo probar
          </h2>
          <ol className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-[#4A4A48]">
            <li>
              <span className="font-semibold text-[#1A1A18]">1.</span>{" "}
              Pega una <span className="font-semibold">cédula</span> de la lista
              de abajo.
            </li>
            <li>
              <span className="font-semibold text-[#1A1A18]">2.</span>{" "}
              Cuando te salude por tu nombre, describe un{" "}
              <span className="font-semibold">síntoma</span>.
            </li>
            <li>
              <span className="font-semibold text-[#1A1A18]">3.</span>{" "}
              Te preguntará tu{" "}
              <span className="font-semibold">ciudad</span> (Quito o Guayaquil).
            </li>
            <li>
              <span className="font-semibold text-[#1A1A18]">4.</span>{" "}
              Verás el bloque con el copago exacto y el hospital más
              conveniente.
            </li>
          </ol>
          <p className="mt-3 rounded-md bg-[#FFF8E6] px-2.5 py-2 text-[11.5px] leading-relaxed text-[#7A5800]">
            <span className="font-semibold">Caso edge:</span> pide{" "}
            <span className="font-mono">&quot;dolor en el pecho&quot;</span> y
            elige <span className="font-semibold">Guayaquil</span>. La
            Cardiología solo existe en Quito, así que el agente te ofrecerá
            opciones de otra ciudad.
          </p>
        </div>

        <div className="rounded-xl border border-[#D8D8D5] p-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
            Cédulas de prueba
          </h2>
          <ul className="mt-3 space-y-2.5">
            {TEST_PATIENTS.map((p) => (
              <li
                key={p.dni}
                className="rounded-lg bg-[#F1F1EE] px-3 py-2.5 text-[12.5px] leading-snug"
              >
                <div className="font-mono text-[14px] font-semibold text-[#1A1A18] select-all">
                  {p.dni}
                </div>
                <div className="text-[#6B6B68]">
                  {p.name} · {p.plan}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#D8D8D5] p-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
            Síntomas de ejemplo
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SAMPLE_SYMPTOMS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-[#D8D8D5] bg-white px-2.5 py-1 text-[12px] text-[#4A4A48]"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-[#8A8A86]">
            Tip de demo: compara el mismo síntoma entre María (Platinum) y
            Carlos (Básico) — verás que el hospital recomendado cambia según el
            plan. Y prueba la misma especialidad en Quito vs Guayaquil.
          </p>
        </div>
      </aside>

      {/* Chat principal */}
      <main className="flex-1">
        <ChatView />
      </main>
    </div>
  );
}
