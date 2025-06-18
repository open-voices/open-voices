import { createTheme, MantineProvider } from "@mantine/core";
import { hydrate, LocationProvider, prerender as ssr, Route, Router } from "preact-iso";
import { FC } from "react";

import { NotFound } from "./pages/_404.jsx";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import "./lib/theme"
import { theme } from "./lib/theme";

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
            <Route path={ "/websites" }
                   component={ Dashboard }/>
            <Route path={ "/comments" }
                   component={ Dashboard }/>
            <Route path={ "/users" }
                   component={ Dashboard }/>
            <Route path={ "/profile" }
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
