import { useEffect, useState, type FC } from "react";
import { Title, Text, Card, Button, Group, ActionIcon } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { API_CLIENT } from "../lib/client";
import type {
  GetWebsitesListResponse,
  Website,
  Websites as WebsitesType,
} from "../types/website";
import {
  IconChevronUp,
  IconDatabaseExclamation,
  IconEdit,
  IconEye,
  IconSelector,
  IconTrash,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { WEBSITE_QUERY_KEY } from "../lib/const";
import {
  ADVANCED_QUERY_SCHEMA,
  FILTER_SCHEMA,
} from "@open-voices/validation/advanced-schemas";
import { z } from "zod/v4";
import { parametrizeAdvancedQuery } from "../lib/parametrize-advanced-query";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Filter } from "../components/filters";
import { cn } from "../lib/cn";

type Schema = z.infer<typeof ADVANCED_QUERY_SCHEMA>;
type FilterType = NonNullable<Schema["filters"]>[number];

async function getWebsites(
  page: number,
  limit: number,
  sort?: Schema["sort"],
  filters: Schema["filters"] = []
) {
  const query: Schema = {
    page,
    limit,
    filters,
    sort,
  };

  const response = await API_CLIENT.api.websites.$get({
    query: parametrizeAdvancedQuery(query),
  });

  if (response.status !== 200) {
    return {} as GetWebsitesListResponse;
  }

  const data = await response.json();
  return data;
}

function openCreateWebsiteModal() {
  modals.openContextModal({
    modal: "create-website",
    size: "lg",
    title: <Title order={4}>Create New Website</Title>,
    innerProps: {},
  });
}

export const Websites: FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Website>>({
    columnAccessor: "name",
    direction: "asc",
  });

  const filters_form = useForm({
    initialValues: {
      id: undefined as FilterType | undefined,
      name: undefined as FilterType | undefined,
      url: undefined as FilterType | undefined,
      description: undefined as FilterType | undefined,
    },
    validate: zod4Resolver(
      z.object({
        id: FILTER_SCHEMA.optional(),
        name: FILTER_SCHEMA.optional(),
        url: FILTER_SCHEMA.optional(),
        description: FILTER_SCHEMA.optional(),
      })
    ),
    mode: "controlled",
  });

  const { data: websites, isLoading } = useQuery({
    queryKey: [WEBSITE_QUERY_KEY, page, limit, sortStatus, filters_form.values],
    queryFn: () =>
      getWebsites(
        page,
        limit,
        {
          by: sortStatus.columnAccessor,
          direction: sortStatus.direction,
        },
        Object.entries(filters_form.values)
          .map(([key, value]) => {
            if (value === undefined) {
              return false;
            }

            return {
              ...value,
              by: key,
            } as FilterType;
          })
          .filter((v) => v !== false)
      ),
    placeholderData: keepPreviousData,
  });
  const [records, setRecords] = useState<WebsitesType>([]);

  // Fetch websites and set records when the page or limit changes
  useEffect(() => {
    setRecords((websites?.websites ?? []) as WebsitesType);
  }, [websites]);

  // Initial load to set records
  // This is to ensure that the records are set when the component mounts
  useEffect(() => {
    setRecords((websites?.websites ?? []) as WebsitesType);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mbb-4">
        <div>
          <Title order={2} mb="sm">
            Websites Management
          </Title>
          <Text c="dimmed" mb="xl">
            Manage websites, view details, and perform actions on website
            records.
          </Text>
        </div>
        <Button
          className="pointer-events-auto"
          onClick={openCreateWebsiteModal}
        >
          Create New Website
        </Button>
      </div>
      <Card>
        <DataTable
          className="min-h-[300px]"
          withColumnBorders
          striped
          highlightOnHover
          records={records}
          columns={[
            {
              accessor: "id",
              title: "#",
              textAlign: "right",
              width: 150,
              ellipsis: true,
              filter({ close }) {
                return (
                  <Filter
                    _type="string"
                    field="id"
                    onChange={(value) =>
                      filters_form.setFieldValue("id", value)
                    }
                    value={filters_form.values.id}
                    close={close}
                    withClearButton
                    withAdvancedControls
                  />
                );
              },
              filtering: !!filters_form.values.id,
              filterPopoverProps: {
                withArrow: true,
                arrowRadius: 4,
                arrowSize: 10,
              },
            },
            {
              accessor: "name",
              width: 300,
              sortable: true,
              ellipsis: true,
              filter({ close }) {
                return (
                  <Filter
                    _type="string"
                    field="name"
                    onChange={(value) =>
                      filters_form.setFieldValue("name", value)
                    }
                    value={filters_form.values.name}
                    close={close}
                    withClearButton
                    withAdvancedControls
                  />
                );
              },
              filtering: !!filters_form.values.name,
              filterPopoverProps: {
                withArrow: true,
                arrowRadius: 4,
                arrowSize: 10,
              },
            },
            {
              accessor: "url",
              width: 300,
              sortable: true,
              ellipsis: true,
              filter({ close }) {
                return (
                  <Filter
                    _type="string"
                    field="url"
                    onChange={(value) =>
                      filters_form.setFieldValue("url", value)
                    }
                    value={filters_form.values.url}
                    close={close}
                    withClearButton
                    withAdvancedControls
                  />
                );
              },
              filtering: !!filters_form.values.url,
              filterPopoverProps: {
                withArrow: true,
                arrowRadius: 4,
                arrowSize: 10,
              },
            },
            {
              accessor: "description",
              filter({ close }) {
                return (
                  <Filter
                    _type="string"
                    field="description"
                    onChange={(value) =>
                      filters_form.setFieldValue("description", value)
                    }
                    value={filters_form.values.description}
                    close={close}
                    withClearButton
                    withAdvancedControls
                  />
                );
              },
              filtering: !!filters_form.values.description,
              filterPopoverProps: {
                withArrow: true,
                arrowRadius: 4,
                arrowSize: 10,
              },
              render(record) {
                return (
                  <Text c="dimmed" className={"whitespace-pre-line text-sm"}>
                    {record.description || "No description available"}
                  </Text>
                );
              },
            },
            {
              accessor: "actions",
              title: "",
              width: 150,
              textAlign: "right",
              render(record) {
                return (
                  <Group gap={4} justify="right" wrap="nowrap">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="green"
                      onClick={() => {}}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => {}}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => {}}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                );
              },
            },
          ]}
          emptyState={
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 py-8 w-full",
                {
                  hidden: records.length === 0,
                }
              )}
            >
              <IconDatabaseExclamation
                className="text-black mb-4"
                size={40}
                strokeWidth={1}
              />
              <Title order={4} className="text-black">
                No website found
              </Title>
              <Text c="dimmed">
                You can create a new website by clicking the button below.
              </Text>
              <Button
                className="pointer-events-auto"
                onClick={openCreateWebsiteModal}
              >
                Create New Website
              </Button>
            </div>
          }
          fetching={isLoading}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          sortIcons={{
            sorted: <IconChevronUp size={14} />,
            unsorted: <IconSelector size={14} />,
          }}
          totalRecords={websites?.total ?? 0}
          recordsPerPage={limit}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={[10, 15, 20, 25, 50]}
          onRecordsPerPageChange={setLimit}
        />
      </Card>
    </>
  );
};
