/* v8 ignore start */
import {
    Prisma, PrismaClient
} from "../generated/prisma";

export const PRISMA = new PrismaClient().$extends({
    model: {
        $allModels: {
            async exists<T>(
                this: T,
                where: Prisma.Args<T, `findFirst`>[`where`]
            ): Promise<boolean> {
                const context = Prisma.getExtensionContext(this);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (context as any).findFirst({
                    where,
                });
                return result !== null;
            },
        },
    },
});

/* v8 ignore stop */
