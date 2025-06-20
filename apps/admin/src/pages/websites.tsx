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
import { useQuery } from "@tanstack/react-query";
import { WEBSITE_QUERY_KEY } from "../lib/const";
import { ADVANCED_QUERY_SCHEMA } from "@open-voices/validation/advanced-schemas";
import { z } from "zod/v4";
import { parametrizeAdvancedQuery } from "../lib/parametrize-advanced-query";

type Schema = z.infer<typeof ADVANCED_QUERY_SCHEMA>;

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

  const { data: websites, isLoading } = useQuery({
    queryKey: [WEBSITE_QUERY_KEY, page, limit, sortStatus],
    queryFn: () =>
      getWebsites(
        page,
        limit,
        {
          by: sortStatus.columnAccessor,
          direction: sortStatus.direction,
        },
        []
      ),
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
              // this column has a custom title
              title: "#",
              // right-align column
              textAlign: "right",
              width: 150,
              ellipsis: true,
            },
            {
              accessor: "name",
              width: 300,
              sortable: true,
              ellipsis: true,
            },
            {
              accessor: "url",
              width: 300,
              sortable: true,
              ellipsis: true,
            },
            {
              accessor: "description",
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
            <div className="flex flex-col items-center justify-center gap-2 py-8 w-full">
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
