/// <reference types="vite/client" />

import { type MODAL_REGISTRY } from './components/modals/registry';

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof MODAL_REGISTRY;
  }
}