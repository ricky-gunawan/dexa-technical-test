import { useQuery } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";
import { request, User, UserUpdate } from "../api";

const fieldLabels: Record<string, string> = {
  name: "nama",
  email: "email",
  photoURL: "foto profil",
  position: "posisi",
  phoneNumber: "nomor telepon",
  passwordChanged: "kata sandi",
};

export function UpdateToast({
  event,
  onClose,
}: {
  event: UserUpdate;
  onClose: () => void;
}) {
  const { data: user } = useQuery({
    queryKey: ["user", event.userId],
    queryFn: () => request<User>(`/user/${event.userId}`),
  });
  const changes = Object.keys(event.changes).map(
    (field) => fieldLabels[field] ?? field,
  );


  return (
    <div className="fixed right-3 bottom-3 z-40 grid w-[calc(100vw-24px)] grid-cols-[40px_1fr_25px] gap-3 rounded-xl border border-[#dfe6e9] bg-white p-4 shadow-[0_18px_55px_rgba(25,46,60,.18)] sm:right-6 sm:bottom-6 sm:w-[390px]">
      <div className="grid size-10 place-items-center rounded-[10px] bg-[#e7effe] text-[#2869e8]">
        <Bell size={19} />
      </div>
      <div>
        <strong className="text-[13px]">Data karyawan diperbarui</strong>
        <p className="my-1 text-[11px] leading-4 text-[#6f7d85]">
          <span className="font-bold text-[#202a32]">
            {user?.name ?? "Karyawan"}
          </span>{" "}
          mengubah {changes.length ? changes.join(", ") : "data profil"}.
        </p>
        <small className="text-[9px] text-[#98a1a7]">
          {new Date(event.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
      </div>
      <button
        className="self-start text-[#7a8790]"
        onClick={onClose}
        aria-label="Tutup"
      >
        <X size={17} />
      </button>
    </div>
  );
}
