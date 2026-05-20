
export const parseMedicalSentences = (text: string) => {
  const lines = text.replace(/\.\s+/g, '.\n').split('\n');

  return lines.map((line, lIdx) => {
    if (!line.trim()) return null;

    const headingMatch = line.match(/^###\s+(.+)$/);
    if (headingMatch) {
      return (
        <span key={lIdx} className="mb-3 mt-1 block text-[14px] font-bold uppercase tracking-wider text-[#104F55] first:mt-0">
          {headingMatch[1]}
        </span>
      );
    }

    const boldParts = line.split(/(\*\*.*?\*\*)/g);

    return (
      <span key={lIdx} className="mb-1.5 block text-[14.5px] text-[#2B2D42] last:mb-0">
        {boldParts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-[#028090]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </span>
    );
  });
};

export const formatMedicalAIText = (text: string) => {
  if (!text) return null;

  const chunks = text.split(/(---[\s\S]*?---)/g);

  return (
    <div className="flex flex-col gap-1">
      {chunks.map((chunk, idx) => {
        if (chunk.startsWith('---') && chunk.endsWith('---')) {
          const innerText = chunk.slice(3, -3).trim();
          return (
            <div
              key={idx}
              className="my-3 overflow-hidden relative rounded-2xl border border-[#028090]/20 bg-[#F0F9FA] p-5 text-[#2B2D42] shadow-sm"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#028090]" />
              <div className="pl-2">
                {parseMedicalSentences(innerText)}
              </div>
            </div>
          );
        }
        return <div key={idx} className="leading-relaxed">{parseMedicalSentences(chunk)}</div>;
      })}
    </div>
  );
};