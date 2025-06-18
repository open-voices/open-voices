import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: `node`,
        globals:     true,
        reporters:   [ `default` ],
        coverage:    {
            enabled:   true,
            provider: `v8`,
            reporter: [
                `text`,
                `html`,
            ],
            exclude: [
                `**/*.{html,js,tsx,config.ts,config.cjs,config.mts}`,
                `**/generated/**`,
            ],
        },
    },
});
