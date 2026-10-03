import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { currentUserId, request, User } from "./api";
import { Layout } from "./components/Layout";
import { AttendancePage } from "./pages/AttendancePage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";

function useCurrentUser() {
  const id = currentUserId();
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => request<User>(`/user/${id}`),
    enabled: !!id,
  }).data;
}

function AuthLayout() {
  const user = useCurrentUser();

  if (!user)
    return (
      <div className="grid h-screen place-items-center font-bold text-[#174d3b]">
        Memuat Hadir…
      </div>
    );
  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: Outlet });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: localStorage.getItem("token") ? "/absen" : "/login" });
  },
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (localStorage.getItem("token")) throw redirect({ to: "/absen" });
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
const attendanceRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/absen",
  component: () => <AttendancePage user={useCurrentUser()!} />,
});
const historyRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/riwayat",
  component: () => <HistoryPage user={useCurrentUser()!} />,
});
const profileRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/profil",
  component: () => <ProfilePage user={useCurrentUser()!} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authRoute.addChildren([attendanceRoute, historyRoute, profileRoute]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
