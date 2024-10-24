import moment, { type Moment } from "moment";
import { useState } from "react";
import Countdown from "./Countdown";

type WaitingRoomCardProps = {
  room: {
    id: string;
    title: string;
    opensAt: Moment;
    closesAt: Moment;
  };
};
export default function WaitingRoomCard({ room }: WaitingRoomCardProps) {
  const [now, setNow] = useState(moment());
  const status = now.isBefore(room.opensAt)
    ? "before"
    : now.isBefore(room.closesAt)
      ? "open"
      : "closed";

  const headline = room.title || `Waiting Room ${room.id}`;

  return (
    <div className="overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
        <h3 className="font-medium text-gray-900 text-lg leading-6">
          {headline}
        </h3>
        <a href={`/room/${room.id}`}>
          <button
            disabled={status === "closed"}
            className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Join
          </button>
        </a>
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
                <>Closed {room.closesAt.fromNow()}</>
              )}
            </dt>
            <dd
              className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0"
              suppressHydrationWarning
            >
              {status === "before" ? (
                <>
                  <Countdown
                    onTick={() => setNow(moment())}
                    date={room.opensAt.toDate()}
                    autoStart
                  />
                </>
              ) : status === "open" ? (
                <>
                  <Countdown
                    onTick={() => setNow(moment())}
                    date={room.closesAt.toDate()}
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
