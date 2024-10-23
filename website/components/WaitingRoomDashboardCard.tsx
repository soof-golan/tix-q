import { useQuery } from "@tanstack/react-query";
import moment, { type Moment } from "moment";
import { Link } from "../renderer/Link";
import { trpc } from "../utils/trpc";
import Countdown from "./Countdown";

type WaitingRoomDashboardCardProps = {
  room: {
    id: string;
    title: string;
    opensAt: Moment;
    closesAt: Moment;
    published: boolean;
  };
};
export default function WaitingRoomDashboardCard({
  room,
}: WaitingRoomDashboardCardProps) {
  const status = moment().isBefore(room.opensAt)
    ? "before"
    : moment().isBefore(room.closesAt)
      ? "open"
      : "closed";

  const headline = room.title || `Waiting Room ${room.id}`;
  const utils = trpc.useUtils();
  const roomLiveQuery = useQuery<{
    urlReady: boolean;
  }>({
    // enabled: !!roomQuery.data?.published,
    queryKey: ["roomLiveQuery", room.id],
    retry: false,
    networkMode: "online",
    initialData: { urlReady: false },
    queryFn: async () => {
      const roomUrl = `/room/${room.id}`;
      const response = await fetch(roomUrl);
      if (!response.ok) {
        throw new Error("Url not live yet");
      }
      return {
        urlReady: response.ok,
      };
    },
  });

  const publishApi = trpc.room.publish.useMutation({
    mutationKey: ["room.publish", room.id],
    networkMode: "online",
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        utils.room.readUnique.invalidate({ id: room.id }),
        utils.room.readMany.invalidate(),
      ]);
    },
  });

  return (
    <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
        <h3 className="font-medium text-gray-900 text-lg leading-6">
          {headline}
        </h3>
        <div className="flex flex-row">
          <a href={`/dashboard/live/${room.id}`}>
            <button className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700">
              Live Data
            </button>
          </a>
          {roomLiveQuery.data.urlReady ? (
            <>
              <Link href={`/room/${room.id}`}>
                <button
                  className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  Open Waiting Room
                </button>
              </Link>
              <button
                type="button"
                disabled={!room.published}
                onClick={() => {
                  publishApi.mutate({ id: room.id, publish: false });
                }}
                className="mt-2 mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Unpublish
              </button>
            </>
          ) : (
            <a href={`/dashboard/editor/${room.id}`}>
              <button className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700">
                Edit
              </button>
            </a>
          )}
        </div>
      </div>
      <div className="border-gray-200 border-t">
        <dl>
          <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="font-medium text-gray-500 text-sm">
              {status === "before" ? (
                <>Opens in</>
              ) : status === "open" ? (
                <>Closes in</>
              ) : (
                <>Closed {moment(room.closesAt).fromNow()}</>
              )}
            </dt>
            <dd
              className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0"
              suppressHydrationWarning
            >
              {status === "before" ? (
                <>
                  <Countdown date={room.opensAt.toDate()} />
                </>
              ) : status === "open" ? (
                <>
                  <Countdown date={room.closesAt.toDate()} />
                </>
              ) : (
                <></>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
