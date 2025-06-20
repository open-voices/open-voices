import type { FC } from "react";
import type z from "zod/v4";
import { CREATE_WEBSITE_SCHEMA } from "@open-voices/validation/website-schemas";
import { useForm, type UseFormReturnType } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Button,
  Fieldset,
  Textarea,
  TextInput,
  Text,
  ActionIcon,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react";
import { API_CLIENT, QUERY_CLIENT } from "../../lib/client";
import type { ValidatorError } from "../../types/validator-error";
import { notifications } from "@mantine/notifications";
import type { ContextModalProps } from "@mantine/modals";
import { WEBSITE_QUERY_KEY } from "../../lib/const";

type Schema = z.infer<typeof CREATE_WEBSITE_SCHEMA>;

async function createWebsite(
  data: Schema,
  form: UseFormReturnType<Schema>,
  context: ContextModalProps["context"]
) {
  const response = await API_CLIENT.api.websites.$post({
    json: data,
  });

  if (response.status !== 201) {
    const error_data = await response.json();
    if ("errors" in error_data) {
      (error_data as ValidatorError).errors.forEach((error) => {
        form.setFieldError(error.path, error.message);
      });
      return;
    }
    notifications.show({
      title: "Cannot create website",
      message: error_data.error,
    });
    return;
  }

  // Refetch the websites query to update the list
  QUERY_CLIENT.refetchQueries({
    queryKey: [WEBSITE_QUERY_KEY],
  });
  // Show success notification
  notifications.show({
    title: "Website created",
    message: `Website "${data.name}" has been created successfully.`,
    color: "green",
  });
  // Close the modal and reset the form
  form.reset();
  context.closeAll();
}

export const CreateWebsiteModal: FC<ContextModalProps> = ({ context }) => {
  const form = useForm<Schema>({
    initialValues: {
      name: "",
      url: "",
      description: "",
      page_identifier_rules: [
        {
          url: "",
          format: "",
        },
      ],
    },
    validate: zod4Resolver(CREATE_WEBSITE_SCHEMA),
    mode: "controlled",
    validateInputOnBlur: true,
  });

  return (
    <form
      className="p-4 flex flex-col gap-6"
      onSubmit={form.onSubmit((data) => createWebsite(data, form, context))}
    >
      <TextInput
        label="Website Name"
        description="The name of the website you want to create."
        placeholder="Enter website name"
        required
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Website URL"
        description="The URL of the website you want to create."
        placeholder="Enter website URL (e.g., https://example.com)"
        required
        {...form.getInputProps("url")}
      />
      <Textarea
        label="Description"
        description="A brief description of the website."
        placeholder="Enter website description"
        minRows={3}
        autosize
        {...form.getInputProps("description")}
      />
      <div className="space-y-2">
        <Fieldset
          legend={<>&nbsp;Page Identifier Rules&nbsp;</>}
          className="flex flex-col gap-4"
        >
          <Text c="dimmed" className="text-sm">
            Define rules for identifying pages on the website. Each rule
            consists of a URL pattern and a format for the page identifier. For
            additional information, refer to the documentation.
          </Text>
          <div>
            {form.values.page_identifier_rules.map((rule, index) => (
              <div
                key={index}
                className="space-y-3 mb-4 last:mb-0 relative border border-neutral-300 rounded p-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <Title order={5} className="text-sm">
                    Rule {index + 1}
                  </Title>
                  <div className="flex items-center gap-2">
                    <ActionIcon
                      className="brutal-button-inverted disabled:opacity-50 disabled:grayscale-75"
                      disabled={
                        form.values.page_identifier_rules.length <= 1 ||
                        index === 0
                      }
                      onClick={() =>
                        form.reorderListItem("page_identifier_rules", {
                          from: index,
                          to: index - 1,
                        })
                      }
                    >
                      <IconChevronUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      className="brutal-button-inverted disabled:opacity-50 disabled:grayscale-75"
                      disabled={
                        form.values.page_identifier_rules.length <= 1 ||
                        index === form.values.page_identifier_rules.length - 1
                      }
                      onClick={() =>
                        form.reorderListItem("page_identifier_rules", {
                          from: index,
                          to: index + 1,
                        })
                      }
                    >
                      <IconChevronDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      className="bg-[#ffa07a] brutal-button-inverted disabled:opacity-50 disabled:grayscale-75"
                      disabled={form.values.page_identifier_rules.length <= 1}
                      onClick={() =>
                        form.removeListItem("page_identifier_rules", index)
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </div>
                </div>
                <TextInput
                  label={`URL`}
                  description="The URL pattern for this rule."
                  placeholder="Enter URL pattern"
                  required
                  {...form.getInputProps(`page_identifier_rules.${index}.url`)}
                />
                <TextInput
                  label={`Format`}
                  description="The format for this rule."
                  placeholder="Enter format"
                  required
                  {...form.getInputProps(
                    `page_identifier_rules.${index}.format`
                  )}
                />
              </div>
            ))}
          </div>
          <Button
            className="ml-auto"
            onClick={() => {
              form.insertListItem("page_identifier_rules", {
                url: "",
                format: "",
              });
            }}
          >
            Add Rule
          </Button>
        </Fieldset>
        {form.errors.page_identifier_rules && (
          <Text c="red" className="text-xs">
            {form.errors.page_identifier_rules}
          </Text>
        )}
      </div>

      <Button type="submit" className="mt-4">
        Create Website
      </Button>
    </form>
  );
};
