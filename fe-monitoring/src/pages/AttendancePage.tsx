import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filter } from "lucide-react";
import { Attendance, Page, request } from "../api";
import { Avatar, PageHeader, Pagination } from "../components/ui";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const field =
  "h-10 min-w-0 rounded-[9px] border border-[#dce2e6] bg-white px-3 outline-none focus:border-[#6d9bea] focus:ring-3 focus:ring-[#e4edfc]";
const cell = "border-t border-[#edf0f2] px-4 py-4 text-[13px] md:px-6";
const dateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = new Date();
const defaultTo = dateInput(today);
const defaultFrom = dateInput(
  new Date(today.getFullYear(), today.getMonth(), 1),
);

export function AttendancePage() {
  const [pageCursor, setPageCursor] = useState<string | null>(null);
  const [trail, setTrail] = useState<(string | null)[]>([]);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const { data: page, isPending: loading } = useQuery({
    queryKey: ["attendance", from, to, pageCursor],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "15" });
      if (pageCursor) params.set("cursor", pageCursor);
      if (from) params.set("from", new Date(`${from}T00:00:00`).toISOString());
      if (to) params.set("to", new Date(`${to}T23:59:59.999`).toISOString());
      return request<Page<Attendance>>(`/absensi?${params}`);
    },
  });
  const rows = page?.data ?? [];
  const nextCursor = page?.nextCursor;

  return (
    <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8 md:py-13 lg:px-[5vw]">
      <PageHeader title="Riwayat Absensi Karyawan" />
      <section className="overflow-hidden rounded-2xl border border-[#e5e9ec] bg-white shadow-[0_8px_30px_rgba(23,43,56,.035)]">
        <form
          className="flex flex-wrap items-end gap-3 border-b border-[#e5e9ec] p-4 md:px-6 md:py-5"
          onSubmit={(event) => {
            event.preventDefault();
            setPageCursor(null);
            setTrail([]);
          }}
        >
          <label className="grid min-w-0 flex-1 basis-full gap-2 text-[13px] font-bold sm:basis-[145px]">
            <span>Dari</span>
            <input
              className={field}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="grid min-w-0 flex-1 basis-full gap-2 text-[13px] font-bold sm:basis-[145px]">
            <span>Sampai</span>
            <input
              className={field}
              type="date"
              min={from}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2869e8] px-5 font-bold text-white shadow-sm hover:bg-[#1c59ca] sm:w-auto">
            <Filter size={17} />
            Terapkan Filter
          </button>
        </form>
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                {["Karyawan", "Tanggal", "Waktu", "Aktivitas"].map(
                  (heading) => (
                    <th
                      className="bg-[#fafbfc] px-4 py-3 text-left text-[10px] font-bold tracking-[.09em] text-[#7d8991] uppercase md:px-6"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={cell}>
                    <div className="flex items-center gap-3">
                      <Avatar name={row.userName} photoURL={row.userPhotoURL} />
                      <div>
                        <strong className="block text-[13px]">
                          {row.userName}
                        </strong>
                        <span className="mt-1 block text-[11px] text-[#7a8790]">
                          {row.userPosition}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={cell}>{formatDate(row.createdAt)}</td>
                  <td className={`${cell} font-display font-semibold`}>
                    {formatTime(row.createdAt)}
                  </td>
                  <td className={cell}>
                    <span className="flex items-center gap-2 font-semibold capitalize">
                      <i
                        className={`size-[7px] rounded-full ${row.status === "masuk" ? "bg-[#3fa55b]" : "bg-[#e89731]"}`}
                      />
                      {row.status === "masuk" ? "Masuk" : "Pulang"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-8 text-center text-[13px] text-[#88939b]">
              Memuat data…
            </div>
          )}
          {!loading && !rows.length && (
            <div className="p-8 text-center text-[13px] text-[#88939b]">
              Tidak ada absensi pada periode ini.
            </div>
          )}
        </div>
        <Pagination
          label={`Menampilkan ${rows.length} catatan`}
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
