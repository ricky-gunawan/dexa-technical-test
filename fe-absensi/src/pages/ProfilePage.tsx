import { useQueryClient } from "@tanstack/react-query";
import { SubmitEvent, useState } from "react";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { request, uploadProfilePhoto, User } from "../api";
import { Avatar, PageHeader } from "../components/ui";

const inputClass =
  "h-12 w-full min-w-0 rounded-lg border border-[#dfe4df] bg-white px-3 outline-none focus:border-[#638b7b] focus:ring-3 focus:ring-[#dfece7]";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#174d3b] px-4.5 font-bold text-white hover:bg-[#0c3c2d]";

export function ProfilePage({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const data = new FormData(event.currentTarget);
    try {
      const photo = data.get("photo");
      const photoURL =
        photo instanceof File && photo.size
          ? (await uploadProfilePhoto(photo)).url
          : undefined;
      const phoneNumber = String(data.get("phoneNumber") || "");
      const password = String(data.get("password") || "");
      await request(`/user/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          photoURL,
          phoneNumber,
          password: password || undefined,
        }),
      });
      setMessage("Profil berhasil diperbarui.");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const details = [
    [Mail, "Email", user.email],
    [Phone, "Nomor telepon", user.phoneNumber || "Belum diisi"],
    [UserRound, "Posisi", user.position],
    [ShieldCheck, "Kata sandi", "••••••••••••"],
  ] as const;

  return (
    <div className="mx-auto max-w-[1050px] px-4 py-7 sm:px-8 md:py-13 lg:px-[5vw]">
      <PageHeader
        title="Profil"
        action={
          <button
            className={`min-h-11 w-full rounded-[10px] border px-5 font-bold shadow-sm transition sm:w-auto ${editing ? "border-[#e1caca] bg-[#fff7f7] text-[#8a3b3b] hover:bg-[#ffeded]" : "border-[#174d3b] bg-[#174d3b] text-white hover:bg-[#0c3c2d]"}`}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Batal" : "Edit profil"}
          </button>
        }
      />
      <section className="rounded-2xl border border-[#e4e8e1] bg-white p-4 shadow-[0_12px_40px_rgba(29,57,44,.05)] sm:p-7.5">
        <div className="flex items-start gap-4 border-b border-[#e4e8e1] pb-7 sm:items-center">
          <Avatar name={user.name} photoURL={user.photoURL} large />
          <div>
            <h2 className="font-display text-[23px] font-bold tracking-tight">
              {user.name}
            </h2>
            <p className="my-1 text-[#6f7974]">{user.position}</p>
          </div>
        </div>
        {editing ? (
          <form className="grid gap-4.5 pt-7 lg:grid-cols-2" onSubmit={submit}>
            <label className="grid min-w-0 gap-2 text-[13px] font-bold lg:col-span-2">
              Foto profil
              <input
                className="h-12 w-full min-w-0 rounded-lg border border-[#dfe4df] bg-white text-[13px] text-[#6f7974] file:mr-3 file:h-full file:border-0 file:border-r file:border-[#dfe4df] file:bg-[#f7f8f4] file:px-3 file:font-bold file:text-[#34433d]"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
              <small className="font-normal text-[#87918c]">
                JPEG, PNG, atau WebP. Maksimal 5 MB.
              </small>
            </label>
            <label className="grid min-w-0 gap-2 text-[13px] font-bold">
              Nomor telepon
              <input
                className={inputClass}
                name="phoneNumber"
                defaultValue={user.phoneNumber || ""}
                placeholder="08xxxxxxxxxx"
              />
            </label>
            <label className="grid min-w-0 gap-2 text-[13px] font-bold">
              Kata sandi baru
              <input
                className={inputClass}
                name="password"
                type="password"
                minLength={8}
                placeholder="Kosongkan jika tidak diubah"
              />
            </label>
            <button
              className={`${buttonClass} w-full shadow-sm disabled:opacity-60 sm:w-auto lg:col-span-2 lg:justify-self-start`}
              disabled={saving}
            >
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </button>
          </form>
        ) : (
          <div className="grid gap-7 pt-7 sm:grid-cols-2">
            {details.map(([Icon, label, value]) => (
              <div className="flex items-center gap-3" key={label}>
                <Icon className="w-5 text-[#718078]" />
                <span className="block text-[11px] text-[#87918c]">
                  {label}
                  <strong className="mt-1 block text-sm text-[#283630]">
                    {value}
                  </strong>
                </span>
              </div>
            ))}
          </div>
        )}
        {message && (
          <p className="mt-3.5 rounded-lg bg-[#eff8e2] px-3 py-2.5 text-[13px] text-[#285c49]">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
