import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

export function Avatar({
  name,
  photoURL,
  large = false,
}: {
  name: string;
  photoURL?: string | null;
  large?: boolean;
}) {
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#d8f265] font-extrabold text-[#174d3b] ${large ? "size-[78px] text-2xl" : "size-[38px]"}`}
    >
      {photoURL ? (
        <img
          className="size-full object-cover"
          src={photoURL}
          alt={`Foto ${name}`}
        />
      ) : (
        name[0]
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-9 md:flex-nowrap">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold tracking-[0.13em] text-[#728078] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="my-1 font-display text-[28px] font-extrabold tracking-[-0.04em] text-[#1a2923] md:text-4xl">
          {title}
        </h1>
        {description && <p className="text-sm text-[#6f7974]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Pagination({
  count,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  count: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const button =
    "grid size-9 place-items-center rounded-lg border border-[#e4e8e1] bg-white disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <footer className="flex items-center justify-between border-t border-[#e4e8e1] px-4 py-4 text-xs text-[#6f7974] md:px-6">
      <span>Menampilkan {count} catatan</span>
      <div className="flex gap-2">
        <button className={button} disabled={!canPrevious} onClick={onPrevious}>
          <ChevronLeft size={18} />
        </button>
        <button className={button} disabled={!canNext} onClick={onNext}>
          <ChevronRight size={18} />
        </button>
      </div>
    </footer>
  );
}
