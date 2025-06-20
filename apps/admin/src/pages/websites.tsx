import { useEffect, useState, type FC } from "react";
import { Title, Text, Card, Button, Group, ActionIcon } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { API_CLIENT } from "../lib/client";
import type {
  Website,
  Websites,
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
import sortBy from "lodash/sortBy";

async function getWebsites(): Promise<WebsitesType> {
  const response = await API_CLIENT.api.websites.$get();

  if (response.status !== 200) {
    return [];
  }

  const data = await response.json();
  return data as unknown as WebsitesType;
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
  const { data: websites } = useQuery({
    queryKey: [WEBSITE_QUERY_KEY],
    queryFn: getWebsites,
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Website>>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [records, setRecords] = useState(sortBy(websites, "name"));

  useEffect(() => {
    const data = sortBy(websites, sortStatus.columnAccessor) as Websites;
    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [sortStatus, websites]);

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
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          sortIcons={{
            sorted: <IconChevronUp size={14} />,
            unsorted: <IconSelector size={14} />,
          }}

        />
      </Card>
    </>
  );
};
