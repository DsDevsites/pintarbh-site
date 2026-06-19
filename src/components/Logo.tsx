type LogoProps = {
  logoUrl?: string;
  dark?: boolean;
  compactMobile?: boolean;
};

export function Logo({ logoUrl, dark = true, compactMobile = false }: LogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="PintarBH"
        className={compactMobile ? 'h-12 w-12 object-contain md:h-10 md:w-auto md:max-w-[180px]' : 'h-10 w-auto max-w-[180px] object-contain'}
      />
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
      <div className={compactMobile ? 'relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white md:h-10 md:w-10' : 'relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white'}>
        <span className="text-lg font-bold">P</span>
        <span className="rainbow-strip absolute -bottom-1 left-2 right-2 h-1 rounded-full" />
      </div>
      <span className={`${compactMobile ? 'hidden md:inline md:text-2xl lg:text-3xl' : 'inline text-[28px] md:text-3xl'} ${dark ? 'truncate font-semibold leading-none tracking-normal text-zinc-950' : 'truncate font-semibold leading-none tracking-normal text-white'}`}>
        PintarBH
      </span>
    </div>
  );
}
