import type { auth } from "../lib/auth.ts";

interface HonoVariables {
    user:    typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
}

type HonoBindings = never;

export interface HonoEnv {
    Variables: HonoVariables
    Bindings:  HonoBindings
}
