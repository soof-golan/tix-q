import Countdown from "./Countdown";
import moment from "moment";
import { useState } from "react";

type WaitingRoomCardProps = {
  room: {
    id: string;
    title: string;
    opensAt: string;
    closesAt: string;
  };
};
export default function WaitingRoomCard({ room }: WaitingRoomCardProps) {
  const [now, setNow] = useState(moment());
  const status = now.isBefore(room.opensAt)
    ? "before"
    : moment().isBefore(room.closesAt)
    ? "open"
    : "closed";

  const headline = room.title || `Waiting Room ${room.id}`;

  return (
    <div className="overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {headline}
        </h3>
        <a href={`/room/${room.id}`}>
          <button
            disabled={status === "closed"}
            className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Join
          </button>
        </a>
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
                  <Countdown
                    onTick={() => setNow(moment())}
                    date={moment(room.opensAt).toDate()}
                    autoStart
                  />
                </>
              ) : status === "open" ? (
                <>
                  <Countdown
                    onTick={() => setNow(moment())}
                    date={moment(room.closesAt).toDate()}
                    autoStart
                  />
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
