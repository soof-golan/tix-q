import { onBeforeRender } from "./index.page.server";
import { inferProps } from "../../renderer/types";
import WaitingRoomCard from "../../components/WaitingRoomCard";
import moment from "moment";

export { Page };

type Props = inferProps<typeof onBeforeRender>;

function Page({ rooms: _rooms }: Props) {
  const rooms = _rooms.map((room) => ({
    ...room,
    opensAt: moment(room.opensAt),
    closesAt: moment(room.closesAt),
  }));
  return (
    <>
      <h1 className="p-4 text-center text-4xl font-bold text-white">
        Public Rooms
      </h1>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ul className="flex flex-col gap-4 ">
            {rooms
              .filter((room) =>
                moment().subtract(1, "day").isBefore(moment(room.closesAt))
              )
              .map((room) => (
                <WaitingRoomCard key={room.id} room={room} />
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
