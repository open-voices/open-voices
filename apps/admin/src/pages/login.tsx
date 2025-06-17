import { Button, Card, Center, Checkbox, Loader, TextInput, Title } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { LocationHook, useLocation } from "preact-iso";
import { FC, useEffect } from "react";
import { z } from "zod/v4";
import { AUTH_CLIENT } from "../lib/client";

const schema = z.object({
    email:       z.email("Invalid email address"),
    password:    z.string(),
    remember_me: z.boolean().optional(),
});

function makeHandleSubmit(form: UseFormReturnType<z.infer<typeof schema>>, location: LocationHook) {
    return async function handleSubmit(values: z.infer<typeof schema>) {
        const response = await AUTH_CLIENT.signIn.email({
            email:      values.email,
            password:   values.password,
            rememberMe: values.remember_me ?? false,
        });

        if (response.error) {
            form.setFieldError("email", response.error.message)
            return;
        }

        location.route("/dashboard")
    };
}

export const Login: FC = () => {
    const [is_loading, setIsLoading] = useToggle()

    const form = useForm({
        initialValues: {
            email:       "",
            password:    "",
            remember_me: false,
        },
        validate:      zod4Resolver(schema),
    }) as unknown as UseFormReturnType<z.infer<typeof schema>>;

    const location = useLocation()

    useEffect(() => {
        setIsLoading(true)
        AUTH_CLIENT.getSession().then((session) => {
            if(session && !session.error && !!session.data) {
                location.route("/dashboard");
                return;
            }
            setIsLoading(false)
        })
    }, [])

    return (
        <Center className={ "h-dvh w-dvw" } component={"main"}>
            <Card className={ "gap-8 p-8 max-w-md w-full flex flex-col" }
                  withBorder>
                <div className={ "w-full" }>
                    <Title order={ 1 }
                           className={ "text-center" }
                           c={ "dark.9" }>
                        Open Voices
                    </Title>
                    <Title order={ 3 }
                           className={ "text-center text-base font-normal" }
                           c={ "dark.3" }>
                        Admin Sign In
                    </Title>
                </div>
                <form onSubmit={ form.onSubmit(makeHandleSubmit(form, location)) }
                      className={ "space-y-3 flex flex-col" }>
                    {
                        is_loading && <Loader className={"mx-auto"}/>
                    }
                    {
                        !is_loading &&
                        (
                            <>
                                <TextInput label="Email"
                                           placeholder="Enter your email"
                                           { ...form.getInputProps("email") }/>
                                <TextInput label="Password"
                                           placeholder="Enter your password"
                                           type="password"
                                           { ...form.getInputProps("password") }/>
                                <Checkbox label="Remember Me"
                                          { ...form.getInputProps("remember_me", {type: "checkbox"}) }/>

                                <Button type={ "submit" }
                                        className={ "ml-auto" }>
                                    Sing In
                                </Button>
                            </>
                        )
                    }
                </form>
            </Card>
        </Center>
    );
};