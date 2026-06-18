type LogoProps = {
  logoUrl?: string;
  dark?: boolean;
};

export function Logo({ logoUrl, dark = true }: LogoProps) {
  if (logoUrl) {
    return <img src={logoUrl} alt="PintarBH" className="h-10 w-auto max-w-[180px] object-contain" />;
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white">
        <span className="text-lg font-bold">P</span>
        <span className="rainbow-strip absolute -bottom-1 left-2 right-2 h-1 rounded-full" />
      </div>
      <span className={dark ? 'truncate text-[28px] font-semibold leading-none tracking-normal text-zinc-950 md:text-3xl' : 'truncate text-[28px] font-semibold leading-none tracking-normal text-white md:text-3xl'}>
        PintarBH
      </span>
    </div>
  );
}
