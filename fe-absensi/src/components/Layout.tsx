import { Link } from "@tanstack/react-router";
import { Clock3, History, LogOut, Menu, UserRound, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { User } from "../api";
import { Avatar } from "./ui";

const Brand = () => (
  <div className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-white">
    <span className="grid size-[34px] place-items-center rounded-[10px] bg-[#d8f265] text-base text-[#174d3b]">
      H
    </span>
    <div>
      Hadir
      <small className="block font-sans text-[8px] font-bold tracking-[0.16em] text-[#7d9bad]">
        ABSENSI
      </small>
    </div>
  </div>
);

export function Layout({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const logout = () => {
    localStorage.removeItem("token");
    location.href = "/login";
  };
  const navClass =
    "flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left font-semibold text-[#adc0b8] transition hover:bg-[#285c49] hover:text-white [&.active]:bg-[#285c49] [&.active]:text-white [&.active]:shadow-[inset_3px_0_#d8f265]";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      {menu && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-20 cursor-default bg-black/30 md:hidden"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={`fixed top-0 z-30 flex h-dvh w-[260px] flex-col bg-[#123e30] px-[18px] py-7 text-white shadow-2xl transition-[left] md:sticky md:w-auto md:shadow-none ${menu ? "left-0" : "-left-[270px] md:left-0"}`}
      >
        <div className="px-2.5">
          <Brand />
        </div>
        <button
          className="absolute top-7 right-4 p-1 text-[#98aea5] md:hidden"
          onClick={() => setMenu(false)}
          aria-label="Tutup menu"
        >
          <X />
        </button>
        <nav className="mt-14 grid gap-2">
          <Link
            className={navClass}
            activeProps={{ className: "active" }}
            to="/absen"
            onClick={() => setMenu(false)}
          >
            <Clock3 size={19} />
            Absen
          </Link>
          <Link
            className={navClass}
            activeProps={{ className: "active" }}
            to="/riwayat"
            onClick={() => setMenu(false)}
          >
            <History size={19} />
            Riwayat
          </Link>
          <Link
            className={navClass}
            activeProps={{ className: "active" }}
            to="/profil"
            onClick={() => setMenu(false)}
          >
            <UserRound size={19} />
            Profil
          </Link>
        </nav>
        <div className="mt-auto grid grid-cols-[38px_1fr_30px] items-center gap-2.5 border-t border-[#356052] px-1 pt-5">
          <Avatar name={user.name} photoURL={user.photoURL} />
          <div className="min-w-0">
            <strong className="block truncate text-[13px]">{user.name}</strong>
            <small className="mt-0.5 block truncate text-[11px] text-[#9eb3aa]">
              {user.position}
            </small>
          </div>
          <button
            title="Keluar"
            className="p-1 text-[#98aea5]"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="sticky top-0 z-10 flex h-16 items-center justify-center border-b border-[#e4e8e1] bg-white md:hidden">
          <button
            className="absolute left-4"
            onClick={() => setMenu(true)}
            aria-label="Buka menu"
          >
            <Menu />
          </button>
          <div className="[&_div]:text-[#174d3b] [&_span]:bg-[#174d3b] [&_span]:text-[#d8f265]">
            <Brand />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
