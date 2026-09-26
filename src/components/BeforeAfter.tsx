import { useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

type Props = {
  beforeImage: string;
  afterImage: string;
  title: string;
  description?: string;
};

export function BeforeAfter({ beforeImage, afterImage, title, description }: Props) {
  const [position, setPosition] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);

  function updatePosition(clientX: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(5, Math.min(95, next)));
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200">
      <div
        ref={frameRef}
        className="relative aspect-[4/3] overflow-hidden bg-zinc-100 touch-none select-none"
        onPointerMove={(event) => {
          if (event.buttons) updatePosition(event.clientX);
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updatePosition(event.clientX);
        }}
      >
        <img src={afterImage} alt={`Depois: ${title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={beforeImage} alt={`Antes: ${title}`} loading="lazy" decoding="async" className="h-full w-full max-w-none object-cover" style={{ width: frameRef.current?.clientWidth ?? '100%' }} />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
          <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.12)]" />
          <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-900 shadow-lg">
            <MoveHorizontal className="h-5 w-5" />
          </div>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-zinc-950/75 px-3 py-1.5 text-xs font-semibold text-white">Antes</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-900">Depois</span>
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>}
      </div>
    </article>
  );
}
