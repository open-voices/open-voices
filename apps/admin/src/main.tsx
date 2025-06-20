import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { MantineProvider } from "@mantine/core";
import "./lib/theme";
import { theme } from "./lib/theme";
import { Notifications } from "@mantine/notifications";
import { Login } from "./pages/login";
import { DashboardLayout } from "./components/dashboard-layout";
import { Dashboard } from "./pages/dashboard";
import { Websites } from "./pages/websites";
import { Comments } from "./pages/comments";
import { Users } from "./pages/users";
import { Profile } from "./pages/profile";
import { NotFound } from "./pages/_404";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
      <Notifications />
      <Routes>
        <Route index element={<Login />} />
        <Route path={"dashboard"} element={<DashboardLayout />}>
          <Route index element={<Dashboard/>} />
          <Route path={"websites"} element={<Websites />} />
          <Route path={"comments"} element={<Comments/>} />
          <Route path={"users"} element={<Users/>} />
          <Route path={"profile"} element={<Profile/>} />
        </Route>
        <Route path={"*"} element={<NotFound/>} />
      </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
