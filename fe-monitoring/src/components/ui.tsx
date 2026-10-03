import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

export function Avatar({
  name,
  photoURL,
}: {
  name: string;
  photoURL?: string | null;
}) {
  return (
    <div className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#dce8fc] font-extrabold text-[#2b64c8]">
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
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-9 md:flex-nowrap">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold tracking-[0.13em] text-[#64809a] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="my-1 font-display text-[28px] font-extrabold tracking-[-0.04em] text-[#182b38] md:text-4xl">
          {title}
        </h1>
        {description && <p className="text-sm text-[#74808a]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Pagination({
  label,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  label: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const button =
    "grid size-9 place-items-center rounded-lg border border-[#dfe4e7] bg-white disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <footer className="flex items-center justify-between border-t border-[#e5e9ec] px-4 py-4 text-xs text-[#7b8790] md:px-6">
      <span>{label}</span>
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
