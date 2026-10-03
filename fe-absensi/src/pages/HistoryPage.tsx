import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filter } from "lucide-react";
import { Attendance, Page, request, User } from "../api";
import { PageHeader, Pagination } from "../components/ui";

const time = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const input =
  "h-10 rounded-lg border border-[#dfe4df] bg-white px-3 outline-none focus:border-[#638b7b] focus:ring-3 focus:ring-[#dfece7]";
const dateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = new Date();
const defaultTo = dateInput(today);
const defaultFrom = dateInput(
  new Date(today.getFullYear(), today.getMonth(), 1),
);

export function HistoryPage({ user }: { user: User }) {
  const [pageCursor, setPageCursor] = useState<string | null>(null);
  const [trail, setTrail] = useState<(string | null)[]>([]);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const { data: page, isPending: loading } = useQuery({
    queryKey: ["attendance", user.id, from, to, pageCursor],
    queryFn: () => {
      const query = new URLSearchParams({ userId: user.id, limit: "10" });
      if (from) query.set("from", new Date(`${from}T00:00:00`).toISOString());
      if (to) query.set("to", new Date(`${to}T23:59:59.999`).toISOString());
      if (pageCursor) query.set("cursor", pageCursor);
      return request<Page<Attendance>>(`/absensi?${query}`);
    },
  });
  const rows = page?.data ?? [];
  const nextCursor = page?.nextCursor;

  return (
    <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8 md:py-13 lg:px-[5vw]">
      <PageHeader title="Riwayat Absensi" />
      <section className="overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white shadow-[0_12px_40px_rgba(29,57,44,.05)]">
        <form
          className="flex flex-wrap items-end gap-3 border-b border-[#e4e8e1] p-4 md:px-6 md:py-5"
          onSubmit={(event) => {
            event.preventDefault();
            setPageCursor(null);
            setTrail([]);
          }}
        >
          <label className="grid min-w-0 flex-1 basis-full gap-2 text-[13px] font-bold sm:basis-auto">
            <span>Dari</span>
            <input
              className={input}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <span className="hidden pb-2.5 text-[#98a29d] sm:block">—</span>
          <label className="grid min-w-0 flex-1 basis-full gap-2 text-[13px] font-bold sm:basis-auto">
            <span>Sampai</span>
            <input
              className={input}
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#174d3b] px-5 font-bold text-white shadow-sm hover:bg-[#0c3c2d] md:w-auto">
            <Filter size={17} />
            Terapkan Filter
          </button>
        </form>
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr>
                {["Tanggal", "Waktu", "Aktivitas"].map((heading) => (
                  <th
                    className="bg-[#fafbf8] px-4 py-3 text-left text-[10px] font-bold tracking-[0.09em] text-[#7c8782] uppercase md:px-6"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="border-t border-[#edf0ec] px-4 py-4 text-[13px] font-semibold md:px-6">
                    {new Intl.DateTimeFormat("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(row.createdAt))}
                  </td>
                  <td className="border-t border-[#edf0ec] px-4 py-4 font-display text-[13px] font-semibold md:px-6">
                    {time(row.createdAt)}
                  </td>
                  <td className="border-t border-[#edf0ec] px-4 py-4 text-[13px] md:px-6">
                    <span className="flex items-center gap-2 font-semibold capitalize">
                      <i
                        className={`size-[7px] rounded-full ${row.status === "masuk" ? "bg-[#72a83f]" : "bg-[#e89731]"}`}
                      />
                      {row.status === "masuk" ? "Masuk" : "Pulang"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !rows.length && (
            <div className="p-9 text-center text-[13px] text-[#89928e]">
              Belum ada data pada periode ini.
            </div>
          )}
          {loading && (
            <div className="p-9 text-center text-[13px] text-[#89928e]">
              Memuat data…
            </div>
          )}
        </div>
        <Pagination
          count={rows.length}
          canPrevious={!!trail.length}
          canNext={!!nextCursor}
          onPrevious={() => {
            const previous = trail.at(-1) ?? null;
            setTrail((value) => value.slice(0, -1));
            setPageCursor(previous);
          }}
          onNext={() => {
            setTrail((value) => [...value, pageCursor]);
            setPageCursor(nextCursor ?? null);
          }}
        />
      </section>
    </div>
  );
}
