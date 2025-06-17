import { createTheme, MantineProvider } from "@mantine/core";
import { hydrate, LocationProvider, prerender as ssr, Route, Router } from "preact-iso";
import { FC } from "react";

import { NotFound } from "./pages/_404.jsx";
import "@fontsource-variable/ubuntu-sans-mono";
import "./style.css";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";

const theme = createTheme({
    primaryColor:  "dark",
    fontFamily:    "Ubuntu Sans Mono Variable, monospace",
    defaultRadius: "sm",
    headings:      {
        fontWeight: "500",
    },
    components:    {
        Card: {
            classNames: {
                root: "brutal-card hover:translate[-6px]",
            },
        },
        AppShell: {
            classNames: {
                navbar: "brutal-navbar",
            }
        },
        NavLink: {
            classNames: {
                root: "brutal-nav-link",
            }
        }
    },
});

export function App() {
    return (
        <MantineProvider theme={ theme }>
            <LocationProvider>
                    <Router>
                        <Route path="/"
                               component={ Login }/>
                        <Route default
                               component={ NotFound }/>
                        <Route path={ "/dashboard" }
                               component={ Dashboard }/>
                        <Route path={ "/dashboard/*" }
                               component={ DashboardRouter }/>
                    </Router>
            </LocationProvider>
        </MantineProvider>
    );
}

const DashboardRouter: FC = () => {
    return (
        <Router>
            <Route path={ "/aaaa" }
                   component={ Dashboard }/>
            <Route default
                   component={ NotFound }/>
        </Router>
    );
};

if (typeof window !== "undefined") {
    hydrate(<App/>, document.getElementById("app"));
}

export async function prerender(data) {
    return await ssr(<App { ...data } />);
}
