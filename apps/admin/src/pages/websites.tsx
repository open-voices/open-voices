import { useEffect, useState, type FC } from "react";
import { notifications } from "@mantine/notifications";
import { Box, Title, Text, Card, Stack, Button } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { API_CLIENT } from "../lib/client";
import type { Websites as WebsitesType } from "../types/website";
import { IconDatabaseExclamation, IconMoodEmpty } from "@tabler/icons-react";

async function getWebsites(): Promise<WebsitesType> {
  const response = await API_CLIENT.api.websites.$get();

  if (response.status !== 200) {
    return [];
  }

  const data = await response.json();
  return data as unknown as WebsitesType;
}

export const Websites: FC = () => {
  const [websites, setWebsites] = useState<WebsitesType>([]);

  useEffect(() => {
    getWebsites().then(setWebsites);
  }, []);

  return (
    <>
      <Title order={2} mb="sm">
        Websites Management
      </Title>
      <Text c="dimmed" mb="xl">
        Manage websites, view details, and perform actions on website records.
      </Text>
      <Card>
        <DataTable
          className="min-h-[300px]"
          withColumnBorders
          striped
          highlightOnHover
          // provide data
          records={websites}
          // define columns
          columns={[
            {
              accessor: "id",
              // this column has a custom title
              title: "#",
              // right-align column
              textAlign: "right",
            },
            { accessor: "name" },
            { accessor: "url" },
            {
              accessor: "description",
              width: "25%",
              render(record) {
                return (
                  <Text c="dimmed" className={"whitespace-pre-line text-sm"}>
                    {record.description || "No description available"}
                  </Text>
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
                onClick={() => {
                  alert("heeeeeelloooooooooooooooo");
                }}
              >
                Create New Website
              </Button>
            </div>
          }
        />
      </Card>
    </>
  );
};
