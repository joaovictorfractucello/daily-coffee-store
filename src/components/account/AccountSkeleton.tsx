// Enquanto a sessão é conferida no servidor: blocos lisos no lugar do topo, do banner e da lista.
export function AccountSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-[70rem] animate-pulse flex-col gap-7 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14"
    >
      <div className="flex flex-col items-center gap-3 lg:items-start">
        <div className="size-20 rounded-full bg-muted lg:size-14" />
        <div className="h-7 w-40 rounded-[8px] bg-muted" />
        <div className="h-5 w-52 rounded-[8px] bg-muted" />
      </div>
      <div className="flex flex-col gap-7">
        <div className="h-40 rounded-[1.5rem] bg-muted md:h-48" />
        <div className="h-64 rounded-[8px] bg-muted lg:hidden" />
      </div>
    </div>
  );
}
