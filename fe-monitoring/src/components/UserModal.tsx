import { SubmitEvent, useState } from "react";
import { X } from "lucide-react";
import { request, User } from "../api";

const input =
  "h-12 rounded-[9px] border border-[#dce2e6] bg-white px-3 outline-none focus:border-[#6d9bea] focus:ring-3 focus:ring-[#e4edfc]";
const label = "grid gap-2 text-[13px] font-bold";
const RequiredMark = () => <span className="text-red-500">*</span>;

export function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    const body = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== ""),
    );
    try {
      await request(user ? `/user/${user.id}` : "/user", {
        method: user ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      onSaved();
      onClose();
    } catch (error) {
      setError((error as Error).message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 grid items-end bg-[#102432a8] sm:place-items-center sm:p-5"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-[14px] bg-white shadow-2xl sm:max-w-[560px] sm:rounded-[14px]">
        <header className="flex items-start justify-between border-b border-[#e5e9ec] p-5 sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.13em] text-[#64809a] uppercase">
              {user ? "Perbarui data" : "Data baru"}
            </p>
            <h2 className="mt-1 font-display text-[23px] font-bold tracking-tight">
              {user ? "Edit karyawan" : "Tambah karyawan"}
            </h2>
          </div>
          <button
            className="text-[#7a8790]"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </header>
        <form className="grid gap-4 p-5 sm:px-6" onSubmit={submit}>
          <label className={label}>
            <span>
              Nama lengkap <RequiredMark />
            </span>
            <input
              className={input}
              name="name"
              defaultValue={user?.name || ""}
              required
            />
          </label>
          <label className={label}>
            <span>
              Email <RequiredMark />
            </span>
            <input
              className={input}
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              <span>
                Posisi <RequiredMark />
              </span>
              <input
                className={input}
                name="position"
                defaultValue={user?.position || ""}
                required
              />
            </label>
            <label className={label}>
              Nomor telepon
              <input
                className={input}
                name="phoneNumber"
                defaultValue={user?.phoneNumber || ""}
              />
            </label>
          </div>
          <label className={label}>
            URL foto profil
            <input
              className={input}
              name="photoURL"
              type="url"
              defaultValue={user?.photoURL || ""}
              placeholder="https://…"
            />
          </label>
          <label className={label}>
            <span>
              {user ? "Kata sandi baru" : "Kata sandi"}{" "}
              {!user && <RequiredMark />}
            </span>
            <input
              className={input}
              name="password"
              type="password"
              minLength={8}
              required={!user}
              placeholder={
                user ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"
              }
            />
          </label>
          {error && (
            <div className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[13px] text-[#a83d36]">
              {error}
            </div>
          )}
          <footer className="mt-2 flex gap-2 sm:justify-end">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-[10px] border border-[#dbe1e5] bg-white px-4 font-bold text-[#394750] sm:flex-none"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              className="min-h-11 flex-1 rounded-[10px] bg-[#2869e8] px-4 font-bold text-white hover:bg-[#1c59ca] disabled:opacity-60 sm:flex-none"
              disabled={saving}
            >
              {saving ? "Menyimpan…" : "Simpan data"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
