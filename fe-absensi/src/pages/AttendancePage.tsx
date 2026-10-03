import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { Attendance, Page, request, User } from "../api";
import { PageHeader } from "../components/ui";

const time = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function AttendancePage({ user }: { user: User }) {
  const [now, setNow] = useState(new Date());
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { data: latest = null } = useQuery({
    queryKey: ["latest-attendance", user.id],
    queryFn: async () =>
      (await request<Page<Attendance>>(`/absensi?userId=${user.id}&limit=1`))
        .data[0] || null,
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isToday =
    latest && new Date(latest.createdAt).toDateString() === now.toDateString();
  const hasClockedIn = isToday && latest.status === "masuk";
  const hasClockedOut = isToday && latest.status === "pulang";
  const statusText = hasClockedIn
    ? `Masuk pukul ${time(latest.createdAt)}`
    : isToday && latest.status === "pulang"
      ? `Pulang pukul ${time(latest.createdAt)}`
      : "Belum absen";

  async function clock(status: "masuk" | "pulang") {
    setMessage("");
    try {
      const record = await request<Attendance>("/absensi", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, status }),
      });
      queryClient.setQueryData(["latest-attendance", user.id], record);
      setMessage(
        status === "masuk"
          ? "Selamat bekerja! Kehadiranmu tercatat."
          : "Sampai jumpa! Waktu pulangmu tercatat.",
      );
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-[1450px] px-4 py-7 sm:px-8 md:py-13 lg:px-[5vw]">
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)}
        title={
          <>
            Halo, {user.name.split(" ")[0]}! <span>👋</span>
          </>
        }
        description="Semoga harimu produktif dan menyenangkan."
      />
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#e4e8e1] bg-white p-4 text-center shadow-[0_12px_40px_rgba(29,57,44,.05)] sm:p-7 lg:p-10">
        <p className="text-[11px] font-bold tracking-[0.13em] text-[#728078] uppercase">
          Waktu sekarang
        </p>
        <div className="my-4 font-display text-[clamp(46px,12vw,94px)] leading-[1.1] font-extrabold tracking-[-0.07em] text-[#173d31] md:text-[clamp(60px,7vw,94px)]">
          {now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          <small className="ml-2 text-[17px] tracking-tight text-[#98a29d] sm:text-[22px]">
            {now.toLocaleTimeString("id-ID", { second: "2-digit" })}
          </small>
        </div>
        <div className="my-7 h-px bg-[#e4e8e1]" />
        <div className="flex items-center gap-3 text-left">
          <div
            className={`grid size-[42px] shrink-0 place-items-center rounded-xl ${hasClockedIn ? "bg-[#ebf6cc] text-[#3a672a]" : hasClockedOut ? "bg-[#fff0dc] text-[#e89731]" : "bg-[#f2f3ef] text-[#839089]"}`}
          >
            <Clock3 size={20} />
          </div>
          <div>
            <small className="mb-1 block text-xs text-[#7e8983]">
              Absensi terakhir
            </small>
            <strong className="block">{statusText}</strong>
          </div>
        </div>
        <button
          className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#174d3b] font-bold text-white hover:bg-[#0c3c2d]"
          onClick={() => clock(hasClockedIn ? "pulang" : "masuk")}
        >
          {hasClockedIn ? "Absen Pulang" : "Absen Masuk"}
          <ArrowRight size={19} />
        </button>
        {message && (
          <p className="mt-3.5 rounded-lg bg-[#eff8e2] px-3 py-2.5 text-center text-[13px] text-[#285c49]">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
