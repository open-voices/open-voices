import { AppShell, Center, Loader, NavLink, ScrollArea, Title } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { IconLayoutDashboard, IconMessages, IconUserCircle, IconUserCog, IconWorldCog } from "@tabler/icons-preact";
import { useLocation } from "preact-iso";
import { FC, useEffect } from "react";
import { AUTH_CLIENT } from "../lib/client";

export const DashboardLayout: FC = ({children}) => {
    const [ is_loading, setIsLoading ] = useToggle();
    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);
        AUTH_CLIENT.getSession().then((session) => {
            if (!session || session.error || !session.data) {
                location.route("/");
                return;
            }
            setIsLoading(false);
        });
    }, []);

    if (is_loading) {
        <Center className={ "h-dvh w-dvw" }
                component={ "main" }>
            <Loader/>
        </Center>;
    }

    return (
        <AppShell
            layout="alt"
            padding="md"
            navbar={ {
                width:      300,
                breakpoint: 0,
            } }
        >
            <AppShell.Navbar className={ "space-y-4 p-4" }>
                <AppShell.Section>
                    <Title className="text-center">
                        Open Voices
                    </Title>
                    <Title order={ 3 }
                           className={ "text-center text-base font-normal" }
                           c={ "dark.3" }>
                        Let your community be heard
                    </Title>
                </AppShell.Section>
                <AppShell.Section grow
                                  my="md"
                                  component={ ScrollArea }>
                    <NavLink href={ "/dashboard" }
                             label="Home"
                             active={ location.path === "/dashboard" }
                             leftSection={ <IconLayoutDashboard/> }/>
                    <NavLink href={ "/dashboard/websites" }
                             label="Websites"
                             active={ location.path === "/dashboard/websites" }
                             leftSection={ <IconWorldCog/> }/>
                    <NavLink href={ "/dashboard/comments" }
                             label="Comments"
                             active={ location.path === "/dashboard/comments" }
                             leftSection={ <IconMessages/> }/>
                    <NavLink href={ "/dashboard/users" }
                             label="User Management"
                             active={ location.path === "/dashboard/users" }
                             leftSection={ <IconUserCog/> }/>
                </AppShell.Section>
                <AppShell.Section>
                    <NavLink href={ "/dashboard/profile" }
                                label="My Profile"
                             className={"no-animation"}
                                active={ location.path === "/dashboard/profile" }
                                leftSection={ <IconUserCircle/> }/>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main>
                <div className={ "py-6 px-8" }>
                    { children }
                </div>
            </AppShell.Main>
        </AppShell>
    );
};