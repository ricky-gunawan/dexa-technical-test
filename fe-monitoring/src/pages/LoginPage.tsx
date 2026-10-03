import { SubmitEvent, useState } from "react";
import { login } from "../api";

const input =
  "h-12 rounded-[9px] border border-[#dce2e6] bg-white px-3 outline-none focus:border-[#6d9bea] focus:ring-3 focus:ring-[#e4edfc]";

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
    <main className="grid min-h-screen place-items-center bg-[#fbfcfc] px-5 py-8 sm:px-8">
      <section className="w-full max-w-[410px]">
        <div className="mb-8 flex items-center gap-2.5 font-display text-xl font-extrabold text-[#162b3a]">
          <span className="grid size-[34px] place-items-center rounded-[10px] bg-[#3a7bf0] text-white">
            H
          </span>
          <div>
            Hadir
            <small className="block font-sans text-[8px] font-bold tracking-[0.16em] text-[#7d9bad]">
              MONITORING
            </small>
          </div>
        </div>
        <h1 className="my-2 font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-[34px]">
          Selamat datang
        </h1>
        <p className="mb-8 text-[#74808a]">
          Masuk untuk membuka dashboard monitoring.
        </p>
        <form onSubmit={submit}>
          <label className="mb-4 grid gap-2 text-[13px] font-bold">
            Email
            <input
              className={input}
              name="email"
              type="email"
              placeholder="admin@perusahaan.com"
              required
            />
          </label>
          <label className="mb-4 grid gap-2 text-[13px] font-bold">
            Kata sandi
            <input className={input} name="password" type="password" required />
          </label>
          {error && (
            <div className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-[13px] text-[#a83d36]">
              {error}
            </div>
          )}
          <button
            className="mt-4 h-12 w-full rounded-[10px] bg-[#2869e8] font-bold text-white hover:bg-[#1c59ca] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memproses…" : "Masuk ke dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
