import { usePageContext } from "../../../../renderer/usePageContext";
import { trpc } from "../../../../utils/trpc";
import CountUp from "react-countup";

export { Page };

function Page() {
  const pageContext = usePageContext();
  const id = pageContext.routeParams?.id as string;
  const roomQuery = trpc.room.readUnique.useQuery(
    { id },
    {
      networkMode: "offlineFirst",
    }
  );
  const stats = trpc.room.stats.useQuery(
    { id },
    {
      refetchOnWindowFocus: true,
      refetchInterval: 5000,
      networkMode: "online",
      initialData: { registrantsCount: 0, id },
    }
  );
  const participants = trpc.room.registrants.useQuery(
    { id },
    {
      retry: false,
      enabled: false,
      initialData: { registrants: [], id },
    }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-2">
        <h1 className="p-4 text-center text-4xl font-bold text-white">
          {roomQuery.data?.title || `Waiting Room ${id}`}
        </h1>
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden bg-white bg-opacity-80 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Stats
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Participants in this room:{" "}
                <CountUp
                  end={stats.data?.registrantsCount || 0}
                  preserveValue
                />
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden bg-white bg-opacity-80 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Export
              </h3>
              <button
                disabled={participants.isLoading}
                onClick={async () => {
                  const XLSX = await import("xlsx");
                  const response = await participants.refetch();
                  const rows = response.data?.registrants ?? [];
                  const worksheet = XLSX.utils.json_to_sheet(rows);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "Participants"
                  );
                  XLSX.writeFile(workbook, `participants-${id}.csv`, {
                    bookType: "csv",
                    sheet: "Participants",
                  });
                }}
                className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
