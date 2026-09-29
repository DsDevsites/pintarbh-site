import { useEffect, useRef, useState, type CSSProperties } from 'react';

const paintColors = ['#f685b3', '#fc9f97', '#ca9fdb', '#82d1eb', '#33d6c8', '#f6f386', '#78ba3d'];

type InteractivePaintTitleProps = {
  text: string;
  className?: string;
};

export function InteractivePaintTitle({ text, className = '' }: InteractivePaintTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const total = Math.max(viewport + rect.height, 1);
      const travelled = viewport - rect.top;
      const next = Math.max(0, Math.min(1, travelled / total));
      setProgress(next);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  const colorIndex = Math.min(paintColors.length - 1, Math.floor(progress * paintColors.length));
  const paintColor = paintColors[colorIndex];
  const x = 6 + progress * 88;
  const y = 14 + Math.sin(progress * Math.PI) * 18;
  const rotation = -10 + progress * 20;
  const cylinderRotation = progress * 760;

  return (
    <div
      ref={containerRef}
      className="interactive-paint-title relative select-none"
      style={{ '--paint-color': paintColor } as CSSProperties}
    >
      <h1
        className={`hero-title relative z-10 mx-auto max-w-3xl text-4xl font-light leading-tight tracking-normal text-zinc-950 md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl ${className}`}
      >
        {text}
      </h1>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-8 z-20 h-36 overflow-visible"
      >
        <svg
          viewBox="0 0 1000 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <filter id="rollerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>

            <filter id="rollerTexture" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise" />
              <feComponentTransfer in="grayNoise" result="softNoise">
                <feFuncA type="table" tableValues="0 0.18" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" in2="softNoise" mode="multiply" />
            </filter>

            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f4f5" />
              <stop offset="0.35" stopColor="#8d8d91" />
              <stop offset="0.58" stopColor="#f7f7f8" />
              <stop offset="1" stopColor="#4b4b50" />
            </linearGradient>

            <linearGradient id="handle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#252525" />
              <stop offset="0.5" stopColor="#5a5a5a" />
              <stop offset="1" stopColor="#171717" />
            </linearGradient>

            <linearGradient id="rollerSurface" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={paintColor} stopOpacity="0.82" />
              <stop offset="0.12" stopColor={paintColor} />
              <stop offset="0.5" stopColor={paintColor} />
              <stop offset="0.88" stopColor={paintColor} stopOpacity="0.92" />
              <stop offset="1" stopColor="#666" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <g transform={`translate(${x * 10} ${y}) rotate(${rotation} ${x * 10} 65)`}>
            <ellipse
              cx={x * 10 + 10}
              cy="130"
              rx="75"
              ry="10"
              fill="#111"
              opacity="0.16"
              filter="url(#rollerShadow)"
            />

            <g transform={`translate(-55 -48) rotate(${cylinderRotation} 55 48)`}>
              <rect
                x={x * 10 - 8}
                y="22"
                width="122"
                height="64"
                rx="30"
                fill="url(#rollerSurface)"
                filter="url(#rollerTexture)"
              />
              <ellipse
                cx={x * 10 - 8}
                cy="54"
                rx="10"
                ry="31"
                fill={paintColor}
                opacity="0.88"
              />
              <ellipse
                cx={x * 10 + 114}
                cy="54"
                rx="10"
                ry="31"
                fill="#555"
                opacity="0.75"
              />
              <path
                d={`M${x * 10 - 1} 27 Q ${x * 10 + 52} 12 ${x * 10 + 105} 27`}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.22"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            <path
              d={`M${x * 10 + 108} 73 C ${x * 10 + 136} 82, ${x * 10 + 153} 101, ${x * 10 + 147} 119 L ${x * 10 + 138} 139`}
              fill="none"
              stroke="url(#metal)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            <path
              d={`M${x * 10 + 138} 139 L ${x * 10 + 170} 151`}
              fill="none"
              stroke="url(#handle)"
              strokeWidth="13"
              strokeLinecap="round"
            />

            <path
              d={`M${x * 10 + 139} 135 L ${x * 10 + 169} 147`}
              fill="none"
              stroke="#fff"
              strokeOpacity="0.12"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
