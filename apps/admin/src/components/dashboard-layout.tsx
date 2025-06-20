import {
  AppShell,
  Center,
  Loader,
  NavLink,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconMessages,
  IconUserCircle,
  IconUserCog,
  IconWorldCog,
} from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router";
import { type FC, useEffect } from "react";
import { AUTH_CLIENT } from "../lib/client";
import { NavLink as ReactRouterNavLink } from "react-router";

export const DashboardLayout: FC = () => {
  const [is_loading, setIsLoading] = useToggle();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    AUTH_CLIENT.getSession().then((session) => {
      if (!session || session.error || !session.data) {
        navigate("/");
        return;
      }
      setIsLoading(false);
    });
  }, []);

  if (is_loading) {
    <Center className={"h-dvh w-dvw"} component={"main"}>
      <Loader />
    </Center>;
  }

  return (
    <AppShell
      layout="alt"
      padding="md"
      navbar={{
        width: 300,
        breakpoint: 0,
      }}
    >
      <AppShell.Navbar className={"space-y-4 p-4"}>
        <AppShell.Section>
          <Title className="text-center">Open Voices</Title>
          <Title
            order={3}
            className={"text-center text-base font-normal"}
            c={"dark.3"}
          >
            Let your community be heard
          </Title>
        </AppShell.Section>
        <AppShell.Section grow my="md" component={ScrollArea}>
          <NavLink
            to={"/dashboard"}
            component={ReactRouterNavLink}
            label="Home"
            leftSection={<IconLayoutDashboard />}
          />
          <NavLink
            to={"/dashboard/websites"}
            component={ReactRouterNavLink}
            label="Websites"
            leftSection={<IconWorldCog />}
          />
          <NavLink
            to={"/dashboard/comments"}
            component={ReactRouterNavLink}
            label="Comments"
            leftSection={<IconMessages />}
          />
          <NavLink
            to={"/dashboard/users"}
            component={ReactRouterNavLink}
            label="User Management"
            leftSection={<IconUserCog />}
          />
        </AppShell.Section>
        <AppShell.Section>
          <NavLink
            to={"/dashboard/profile"}
            component={ReactRouterNavLink}
            label="My Profile"
            className={"no-animation"}
            leftSection={<IconUserCircle />}
          />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <div className={"py-6 px-8"}>
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
