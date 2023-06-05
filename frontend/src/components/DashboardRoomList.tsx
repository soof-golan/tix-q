import AppContext from "./AppContext";
import { trpc } from "../utils/trpc";
import CreateRoomCard from "./CreateRoomCard";
import WaitingRoomDashboardCard from "./WaitingRoomDashboardCard";
import { useSigninCheck } from "reactfire";
import AuthButton from "./AuthButton";

function DashboardRoomsList_() {
  const signInCheck = useSigninCheck();
  const rooms = trpc.room.readMany.useQuery(
    {},
    {
      initialData: {
        rooms: [],
      },
    }
  );

  if (!signInCheck.data?.signedIn) {
    return (
      <div className="flex flex-col rounded-xl bg-white bg-opacity-25 p-4 py-2">
        <AuthButton />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col rounded-xl bg-white bg-opacity-25 p-4 py-2">
        <h1 className="text-2xl text-white">Rooms</h1>
        <div className="flex flex-col">
          <CreateRoomCard />
          {rooms.data.rooms.map((room) => (
            <div key={room.id} className="flex flex-row">
              <WaitingRoomDashboardCard room={room} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardRoomList() {
  return (
    <AppContext>
      <DashboardRoomsList_ />
    </AppContext>
  );
}
