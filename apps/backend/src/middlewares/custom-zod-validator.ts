import type {
    z,
    ZodType
} from 'zod/v4';
import type {
    Env,
    Input,
    MiddlewareHandler, ValidationTargets
} from 'hono';
import { validator } from "hono/validator";
import { BAD_REQUEST } from '../lib/const';

type HasUndefined<T> = undefined extends T ? true : false

export function zValidator<
    T extends ZodType,
    Target extends keyof ValidationTargets,
    E extends Env,
    P extends string,
    In = z.input<T>,
    Out = z.output<T>,
    I extends Input = {
        in: HasUndefined<In> extends true
      ? {
          [K in Target]?: In extends ValidationTargets[K]
            ? In
            : { [K2 in keyof In]?: ValidationTargets[K][K2] }
      }
      : {
          [K in Target]: In extends ValidationTargets[K]
            ? In
            : { [K2 in keyof In]: ValidationTargets[K][K2] }
      }
        out: Record<Target, Out>
    },
    V extends I = I,
>(
    target: Target,
    schema: T
): MiddlewareHandler<E, P, V> {
    // @ts-expect-error not typed well
    return validator(target, (value, c) => {
        const parsed = schema.safeParse(value);
        if (!parsed.success) {
            return c.json({
                errors: parsed.error.issues.map((e: z.core.$ZodIssue) => (
                    {
                        path:    e.path.join(`.`),
                        message: e.message,
                    }
                )),
            }, BAD_REQUEST);
        }
        return parsed.data as z.infer<T>;
    });
}
