import { CreateWebsiteModal } from "./create-website";
import { DeleteSelectedWebsitesModal } from "./delete-selected-websites";
import { LoadingModal } from "./loading";

export const MODAL_REGISTRY = {
  "create-website": CreateWebsiteModal,
  "delete-selected-websites": DeleteSelectedWebsitesModal,
  loading: LoadingModal,
};
