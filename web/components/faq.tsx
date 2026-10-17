import { PlusIcon } from "./icons";

export function Faq({ heading, items }: { heading: string; items: [string, string][] }) {
  return (
    <section className="mx-auto max-w-[932px] px-4 py-[49px]">
      <h2 className="mb-6 text-center text-[24px] font-bold leading-6 text-black">{heading}</h2>
      <div className="border-t border-black/10">
        {items.map(([q, a], i) => (
          <details key={q} open={i === 0} className="group border-b border-black/10">
            <summary className="flex cursor-pointer list-none items-center justify-between py-[13px] text-[15px] font-bold leading-[18px] [&::-webkit-details-marker]:hidden">
              {q}
              <PlusIcon className="text-gold transition-transform group-open:rotate-45" />
            </summary>
            <p className="mx-auto max-w-[470px] pb-4 text-[15px] leading-[27px]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
