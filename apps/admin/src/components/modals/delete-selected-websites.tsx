import type { FC } from "react";
import {
  Button,
  Spoiler,
} from "@mantine/core";
import {  IconTrash } from "@tabler/icons-react";
import { API_CLIENT, QUERY_CLIENT } from "../../lib/client";
import { notifications } from "@mantine/notifications";
import { modals, type ContextModalProps } from "@mantine/modals";
import { WEBSITE_QUERY_KEY } from "../../lib/const";
import type { Websites } from "../../types/website";
import { sleep } from "radash";

async function deleteSelectedWebsites(
  ctx: DeleteSelectedWebsitesModalPropsWithContext
) {
  let completed = 0;
  const steps = ctx.innerProps.selected_records.length;
  const static_message = `Deleting ${steps} websites, please wait...`;

  const modal_id = modals.openContextModal({
    modal: "loading",
    title: "Deleting websites",
    innerProps: {
      static_message,
      steps,
      completed,
    },
    closeOnClickOutside: false,
    closeOnEscape: false,
    withCloseButton: false,
  });

  for (const website of ctx.innerProps.selected_records) {
    modals.updateContextModal({
      modalId: modal_id,
      innerProps: {
        static_message,
        message: `Deleting website ${website.url}`,
        steps: ctx.innerProps.selected_records.length,
        completed: ctx.innerProps.selected_records.indexOf(website) + 1,
      },
    });

    /* const response = await API_CLIENT.api.websites[":id"].$delete({
      param: { id: website.id },
    });

    if (response.status !== 200) {
      const error_data = await response.json();
      notifications.show({
        title: "Cannot delete website",
        message:
          error_data.error ??
          (error_data as any).message ??
          "An unknown error occurred.",
        color: "red",
      });
      continue;
    } */
   await sleep(1000); // Simulate API call delay
    // Successfully deleted the website

    completed += 1;
  }

  const final_message = completed < steps ? `${completed} out of ${steps} selected websites have been deleted.`
        : "All selected websites have been deleted."

  modals.updateContextModal({
    modalId: modal_id,
    innerProps: {
      static_message,
      message: final_message,
      steps,
      completed,
    },
  });

  // Refetch the websites query to update the list
  QUERY_CLIENT.refetchQueries({
    queryKey: [WEBSITE_QUERY_KEY],
  });

  let timeout = 5

  const interval = setInterval(() => {
    modals.updateContextModal({
      modalId: modal_id,
      innerProps: {
        static_message,
        message: final_message,
        closing_text: `Closing in ${timeout} sec.`,
        show_closing_text: true,
        steps,
        completed,
      },
    })
    timeout -= 1;
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    ctx.context.closeAll();
  }, 5000);
}

interface DeleteSelectedWebsitesModalProps {
  selected_records: Websites;
}

type DeleteSelectedWebsitesModalPropsWithContext =
  ContextModalProps<DeleteSelectedWebsitesModalProps>;

export const DeleteSelectedWebsitesModal: FC<
  DeleteSelectedWebsitesModalPropsWithContext
> = (ctx) => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm">
        Are you sure you want to delete all the selected websites? This action
        cannot be undone.
      </p>
      <p className="text-sm">
        By deleting these websites, you will remove all associated data,
        including user-generated content, comments, and any other related
        information.
      </p>
      <Spoiler
        showLabel="Show selected websites"
        hideLabel="Hide selected websites"
        maxHeight={0}
        classNames={{
          control: "text-sm font-semibold",
        }}
      >
        <p className="text-sm mt-2 mb-1">
          <strong>Selected Websites:</strong>
        </p>
        <ul className="list-disc pl-5">
          {ctx.innerProps.selected_records.map((website) => (
            <li key={website.id} className="text-sm">
              {website.url}
            </li>
          ))}
        </ul>
      </Spoiler>
      <div className="flex justify-end gap-x-2">
        <Button variant="subtle" onClick={() => ctx.context.closeAll()}>
          I changed my mind
        </Button>
        <Button
          leftSection={<IconTrash size={16} />}
          onClick={() => deleteSelectedWebsites(ctx)}
          className="bg-brutal-red"
        >
          Yes, delete them
        </Button>
      </div>
    </div>
  );
};
