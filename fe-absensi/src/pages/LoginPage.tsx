import { SubmitEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { login } from "../api";

const inputClass =
  "h-12 rounded-lg border border-[#dfe4df] bg-white px-3 outline-none focus:border-[#638b7b] focus:ring-3 focus:ring-[#dfece7]";

export function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      location.reload();
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fafbf8] px-5 py-8 sm:px-8">
      <section className="w-full max-w-[410px]">
        <div className="mb-8 flex items-center gap-2.5 font-display text-xl font-extrabold text-[#174d3b]">
          <span className="grid size-[34px] place-items-center rounded-[10px] bg-[#174d3b] text-[#d8f265]">
            H
          </span>
          <div>
            Hadir
            <small className="block font-sans text-[8px] font-bold tracking-[0.16em] text-[#7d9bad]">
              ABSENSI
            </small>
          </div>
        </div>
        <p className="text-[11px] font-bold tracking-[0.13em] text-[#728078] uppercase">
          Selamat datang kembali
        </p>
        <h1 className="my-2 font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-[34px]">
          Masuk ke akunmu
        </h1>
        <p className="text-[#6f7974]">Gunakan akun karyawan yang terdaftar.</p>
        <form className="mt-8 grid gap-[18px]" onSubmit={submit}>
          <label className="grid gap-2 text-[13px] font-bold">
            Email
            <input
              className={inputClass}
              name="email"
              type="email"
              placeholder="nama@perusahaan.com"
              required
            />
          </label>
          <label className="grid gap-2 text-[13px] font-bold">
            Kata sandi
            <input
              className={inputClass}
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
            />
          </label>
          {error && (
            <p className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[13px] text-[#a93e38]">
              {error}
            </p>
          )}
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#174d3b] font-bold text-white hover:bg-[#0c3c2d] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              "Memproses…"
            ) : (
              <>
                Masuk <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
