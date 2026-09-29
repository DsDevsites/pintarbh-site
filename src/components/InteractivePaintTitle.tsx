import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const paintColors = ['#f685b3', '#fc9f97', '#ca9fdb', '#82d1eb', '#33d6c8', '#f6f386', '#78ba3d'];

type InteractivePaintTitleProps = {
  text: string;
  className?: string;
};

export function InteractivePaintTitle({ text, className = '' }: InteractivePaintTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (active) return;
      setColorIndex((current) => (current + 1) % paintColors.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [active]);

  const updatePoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPoint({
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    });
    setActive(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    updatePoint(event.clientX, event.clientY);
  };

  const handlePointerLeave = () => setActive(false);

  const activeColor = paintColors[colorIndex];

  return (
    <div
      ref={containerRef}
      className="interactive-paint-title relative select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerEnter={(event) => updatePoint(event.clientX, event.clientY)}
      onPointerLeave={handlePointerLeave}
      onPointerDown={(event) => updatePoint(event.clientX, event.clientY)}
      style={{ '--paint-color': activeColor } as React.CSSProperties}
      aria-label={text}
    >
      <h1 className={\`hero-title relative z-10 mx-auto max-w-3xl text-4xl font-light leading-tight tracking-normal text-zinc-950 md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl \${className}\`}>
        {text}
      </h1>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        style={{
          maskImage: \`radial-gradient(circle 95px at \${point.x}% \${point.y}%, black 0%, black 58%, transparent 100%)\`,
          WebkitMaskImage: \`radial-gradient(circle 95px at \${point.x}% \${point.y}%, black 0%, black 58%, transparent 100%)\`,
        }}
      >
        <h1
          className="hero-title mx-auto max-w-3xl text-4xl font-light leading-tight tracking-normal md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl"
          style={{
            backgroundImage: \`linear-gradient(90deg, \${paintColors.join(', ')})\`,
            backgroundSize: '220% 100%',
            backgroundPosition: active ? \`\${point.x}% 50%\` : '50% 50%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {text}
        </h1>

        <motion.div
          className="absolute h-3 rounded-full opacity-70 blur-[1px]"
          style={{
            width: '190px',
            left: \`calc(\${point.x}% - 95px)\`,
            top: \`calc(\${point.y}% + 22px)\`,
            background: \`linear-gradient(90deg, transparent, \${activeColor}, transparent)\`,
            transform: 'rotate(-4deg)',
          }}
          animate={{ opacity: active ? 0.78 : 0 }}
          transition={{ duration: 0.18 }}
        />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-30 hidden md:block"
        style={{
          left: \`calc(\${point.x}% - 10px)\`,
          top: \`calc(\${point.y}% - 9px)\`,
        }}
        animate={{ rotate: active ? -7 : 0, scale: active ? 1 : 0.86, opacity: active ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.45 }}
      >
        <div className="relative h-20 w-10">
          <div
            className="absolute left-0 top-0 h-8 w-10 rounded-[7px] border border-white/70 shadow-lg"
            style={{ background: \`linear-gradient(180deg, \${activeColor}, color-mix(in srgb, \${activeColor} 72%, #111 28%))\` }}
          />
          <div className="absolute left-[15px] top-7 h-11 w-[5px] rotate-[18deg] rounded-full bg-zinc-800 shadow-md" />
          <div className="absolute left-[15px] top-[54px] h-[5px] w-8 rotate-[18deg] rounded-full bg-zinc-700" />
        </div>
      </motion.div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 left-1/2 z-0 h-8 w-44 -translate-x-1/2 rounded-full blur-xl transition-opacity duration-300"
        style={{ background: activeColor, opacity: active ? 0.22 : 0 }}
      />
    </div>
  );
}
