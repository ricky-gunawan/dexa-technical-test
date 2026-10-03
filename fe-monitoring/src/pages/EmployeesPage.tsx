import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { Page, request, User } from "../api";
import { UserModal } from "../components/UserModal";
import { Avatar, PageHeader, Pagination } from "../components/ui";

const cell = "border-t border-[#edf0f2] px-4 py-4 text-[13px] md:px-6";

export function EmployeesPage() {
  const [pageCursor, setPageCursor] = useState<string | null>(null);
  const [trail, setTrail] = useState<(string | null)[]>([]);
  const [modal, setModal] = useState<User | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data: page, isPending: loading } = useQuery({
    queryKey: ["users", pageCursor],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "12" });
      if (pageCursor) params.set("cursor", pageCursor);
      return request<Page<User>>(`/user?${params}`);
    },
  });
  const rows = page?.data ?? [];
  const nextCursor = page?.nextCursor;

  return (
    <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8 md:py-13 lg:px-[5vw]">
      <PageHeader
        title="Daftar Karyawan"
        action={
          <button
            className="flex size-11 items-center justify-center rounded-[10px] bg-[#2869e8] font-bold text-white hover:bg-[#1c59ca] sm:w-auto sm:px-4 sm:text-sm"
            onClick={() => setModal(null)}
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Tambah karyawan</span>
          </button>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-[#e5e9ec] bg-white shadow-[0_8px_30px_rgba(23,43,56,.035)]">
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                {["Karyawan", "Posisi", "Nomor Telepon", ""].map(
                  (heading, index) => (
                    <th
                      className="bg-[#fafbfc] px-4 py-3 text-left text-[10px] font-bold tracking-[.09em] text-[#7d8991] uppercase md:px-6"
                      key={index}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td className={cell}>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} photoURL={user.photoURL} />
                      <div>
                        <strong className="block text-[13px]">
                          {user.name}
                        </strong>
                        <span className="mt-1 block text-[11px] text-[#7a8790]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={cell}>{user.position}</td>
                  <td className={cell}>
                    {user.phoneNumber || (
                      <span className="text-[#74808a]">Belum diisi</span>
                    )}
                  </td>
                  <td className={cell}>
                    <button
                      className="grid size-8 place-items-center rounded-lg border border-[#e1e6e9] bg-white text-[#64727b] hover:border-[#bad0f7] hover:text-[#2869e8]"
                      title="Edit karyawan"
                      onClick={() => setModal(user)}
                    >
                      <Edit3 size={15} />
                    </button>
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
              Karyawan tidak ditemukan.
            </div>
          )}
        </div>
        <Pagination
          label="Data diurutkan berdasarkan nama"
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
      {modal !== undefined && (
        <UserModal
          user={modal}
          onClose={() => setModal(undefined)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
        />
      )}
    </div>
  );
}
