import moment from "moment";
import CountUp from "react-countup";
import Spinner from "../../../../components/Spinner";
import { usePageContext } from "../../../../renderer/usePageContext";
import { trpc } from "../../../../utils/trpc";

export { Page };

function Page() {
  const pageContext = usePageContext();
  const id = pageContext.routeParams?.id as string;
  const roomQuery = trpc.room.readUnique.useQuery(
    { id },
    {
      networkMode: "offlineFirst",
    },
  );
  const stats = trpc.room.stats.useQuery(
    { id },
    {
      retry: false,
      refetchOnWindowFocus: true,
      refetchInterval: 5000,
      networkMode: "online",
      initialData: { registrantsCount: 0, id },
    },
  );
  const participants = trpc.room.registrants.useQuery(
    { id },
    {
      retry: false,
      enabled: false,
      initialData: { registrants: [], id },
    },
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-2">
        <h1 className="p-4 text-center font-bold text-4xl text-white">
          {roomQuery.data?.title || `Waiting Room ${id}`}
        </h1>
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden bg-white bg-opacity-80 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="font-medium text-gray-900 text-lg leading-6">
                Stats
              </h3>
              <div>
                {stats.isFetching ? (
                  <Spinner />
                ) : (
                  <Spinner className="opacity-0" />
                )}
              </div>
              <p className="">
                Participants in this room:{" "}
                <CountUp end={stats.data?.registrantsCount} preserveValue />
              </p>
              <p>(updates every 5 seconds)</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden bg-white bg-opacity-80 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="font-medium text-gray-900 text-lg leading-6">
                Export
              </h3>
              <button
                disabled={participants.isLoading}
                onClick={async () => {
                  const XLSX = await import("xlsx");
                  const response = await participants.refetch();
                  if (participants.error) {
                    console.error(participants.error);
                    alert("Error fetching participants");
                    return;
                  }
                  const rows = response.data?.registrants ?? [];
                  const worksheet = XLSX.utils.json_to_sheet(rows);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "Participants",
                  );
                  XLSX.writeFile(
                    workbook,
                    `participants-${id}-${moment()}.xlsx`,
                    {
                      bookType: "xlsx",
                      sheet: "Participants",
                    },
                  );
                }}
                className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Download XLSX
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
