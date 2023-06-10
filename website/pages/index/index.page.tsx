import { onBeforeRender } from "./index.page.server";
import { inferProps } from "../../renderer/types";

export { Page };

type Props = inferProps<typeof onBeforeRender>;

function Page({ rooms }: Props) {
  return (
    <>
      <h1 className="p-4 text-center text-4xl font-bold text-white">
        Public Rooms
      </h1>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ul className="flex flex-col gap-4 p-4">
            {rooms.map((room) =>
              // <WaitingRoomCard room={room} />
              JSON.stringify(room)
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
