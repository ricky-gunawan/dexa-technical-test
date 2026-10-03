import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  currentUserId,
  request,
  subscribeToUpdates,
  User,
  UserUpdate,
} from "./api";
import { Layout } from "./components/Layout";
import { UpdateToast } from "./components/UpdateToast";
import { AttendancePage } from "./pages/AttendancePage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { LoginPage } from "./pages/LoginPage";

function AuthLayout() {
  const userId = currentUserId();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => request<User>(`/user/${userId}`),
    enabled: !!userId,
  });
  const [event, setEvent] = useState<UserUpdate | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    subscribeToUpdates((update) => {
      setEvent(update);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setTimeout(() => setEvent(null), 6000);
    }, controller.signal);
    return () => controller.abort();
  }, [queryClient]);

  if (!user)
    return (
      <div className="grid h-screen place-items-center font-bold text-[#162b3a]">
        Memuat Hadir Admin…
      </div>
    );

  return (
    <>
      <Layout user={user}>
        <Outlet />
      </Layout>
      {event && <UpdateToast event={event} onClose={() => setEvent(null)} />}
    </>
  );
}

const rootRoute = createRootRoute({ component: Outlet });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: localStorage.getItem("token") ? "/karyawan" : "/login",
    });
  },
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (localStorage.getItem("token")) throw redirect({ to: "/karyawan" });
  },
  component: LoginPage,
});
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: () => {
    if (!localStorage.getItem("token")) throw redirect({ to: "/login" });
  },
  component: AuthLayout,
});
const employeesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/karyawan",
  component: EmployeesPage,
});
const attendanceRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/absensi",
  component: AttendancePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authRoute.addChildren([employeesRoute, attendanceRoute]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
