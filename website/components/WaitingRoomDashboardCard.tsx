import Countdown from "./Countdown";
import moment from "moment";

type WaitingRoomDashboardCardProps = {
  room: {
    id: string;
    title: string;
    opensAt: string;
    closesAt: string;
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

  return (
    <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {headline}
        </h3>
        <div className="flex flex-row">
          <a href={`/dashboard/live/${room.id}`}>
            <button className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700">
              Live Data
            </button>
          </a>
          <a href={`/dashboard/editor/${room.id}`}>
            <button className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700">
              Edit
            </button>
          </a>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              {status === "before" ? (
                <>Opens in</>
              ) : status === "open" ? (
                <>Closes in</>
              ) : (
                <>Closed {moment(room.closesAt).fromNow()}</>
              )}
            </dt>
            <dd
              className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
              suppressHydrationWarning
            >
              {status === "before" ? (
                <>
                  <Countdown date={room.opensAt} />
                </>
              ) : status === "open" ? (
                <>
                  <Countdown date={room.closesAt} />
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
