import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updatePoint(event.clientX, event.clientY);
  };

  const activeColor = paintColors[colorIndex];

  return (
    <div
      ref={containerRef}
      className="interactive-paint-title relative select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerEnter={(event) => updatePoint(event.clientX, event.clientY)}
      onPointerLeave={() => setActive(false)}
      onPointerDown={(event) => updatePoint(event.clientX, event.clientY)}
      style={{ '--paint-color': activeColor } as CSSProperties}
      aria-label={text}
    >
      <h1
        className={`hero-title relative z-10 mx-auto max-w-3xl text-4xl font-light leading-tight tracking-normal text-zinc-950 md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl ${className}`}
      >
        {text}
      </h1>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        style={{
          maskImage: `radial-gradient(circle 95px at ${point.x}% ${point.y}%, black 0%, black 58%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 95px at ${point.x}% ${point.y}%, black 0%, black 58%, transparent 100%)`,
        }}
      >
        <h2
          className="hero-title mx-auto max-w-3xl text-4xl font-light leading-tight tracking-normal md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl"
          style={{
            backgroundImage: `linear-gradient(90deg, ${paintColors.join(', ')})`,
            backgroundSize: '220% 100%',
            backgroundPosition: `${point.x}% 50%`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {text}
        </h2>

        <motion.div
          className="absolute h-3 rounded-full blur-[1px]"
          style={{
            width: '190px',
            left: `calc(${point.x}% - 95px)`,
            top: `calc(${point.y}% + 22px)`,
            background: `linear-gradient(90deg, transparent, ${activeColor}, transparent)`,
          }}
          animate={{ opacity: active ? 0.78 : 0 }}
          transition={{ duration: 0.18 }}
        />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-30 block"
        style={{
          left: `calc(${point.x}% - 18px)`,
          top: `calc(${point.y}% - 34px)`,
        }}
        animate={{
          rotate: active ? -7 : 0,
          scale: active ? 1 : 0.9,
          opacity: active ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.45 }}
      >
        <svg
          width="92"
          height="126"
          viewBox="0 0 92 126"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id="rollerNap" x1="8" y1="10" x2="62" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor={activeColor} />
              <stop offset="0.55" stopColor={activeColor} stopOpacity="0.9" />
              <stop offset="1" stopColor="#5B5B5B" />
            </linearGradient>
            <linearGradient id="rollerHandle" x1="63" y1="67" x2="85" y2="111" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B8B8B8" />
              <stop offset="0.45" stopColor="#777777" />
              <stop offset="1" stopColor="#333333" />
            </linearGradient>
          </defs>

          <rect
            x="8"
            y="7"
            width="55"
            height="72"
            rx="24"
            transform="rotate(-28 8 7)"
            fill="url(#rollerNap)"
          />
          <path
            d="M12 17C22 10 35 8 45 13"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M53 57C64 65 70 69 74 78C77 85 75 91 70 98"
            stroke="url(#rollerHandle)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 98L84 104"
            stroke="#333333"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M70 98L84 104"
            stroke="#AFAFAF"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 left-1/2 z-0 h-8 w-44 -translate-x-1/2 rounded-full blur-xl transition-opacity duration-300"
        style={{ background: activeColor, opacity: active ? 0.22 : 0 }}
      />
    </div>
  );
}
