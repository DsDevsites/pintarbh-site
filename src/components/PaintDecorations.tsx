type PaintDecorationsProps = {
  can?: boolean;
  roller?: boolean;
  className?: string;
  canClassName?: string;
  rollerClassName?: string;
};

function PaintCan() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M24 30h48l-4 48H28l-4-48Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 30c0-7 48-7 48 0s-48 7-48 0Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M31 24c4-10 30-13 38-2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M31 49h34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 59h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PaintRoller() {
  return (
    <svg viewBox="0 0 132 96" fill="none" aria-hidden="true">
      <path d="M19 23h55c9 0 16 7 16 16v4H28c-5 0-9-4-9-9v-11Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M90 39h18c8 0 14 6 14 14v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M122 60v7c0 5-4 9-9 9H82" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M82 76v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M76 88h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M31 32h39" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".65" />
    </svg>
  );
}

export function PaintDecorations({ can = false, roller = false, className = '', canClassName = '', rollerClassName = '' }: PaintDecorationsProps) {
  return (
    <>
      {can && (
        <div className={`paint-decor paint-decor-can ${className} ${canClassName}`}>
          <PaintCan />
        </div>
      )}
      {roller && (
        <div className={`paint-decor paint-decor-roller ${className} ${rollerClassName}`}>
          <PaintRoller />
        </div>
      )}
    </>
  );
}
