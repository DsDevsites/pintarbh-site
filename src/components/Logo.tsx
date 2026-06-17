type LogoProps = {
  logoUrl?: string;
  dark?: boolean;
};

export function Logo({ logoUrl, dark = true }: LogoProps) {
  if (logoUrl) {
    return <img src={logoUrl} alt="PintarBH" className="h-10 w-auto" />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-white">
        <span className="text-lg font-bold">P</span>
        <span className="rainbow-strip absolute -bottom-1 left-2 right-2 h-1 rounded-full" />
      </div>
      <span className={dark ? 'text-xl font-semibold tracking-tight text-zinc-950' : 'text-xl font-semibold tracking-tight text-white'}>
        PintarBH
      </span>
    </div>
  );
}
