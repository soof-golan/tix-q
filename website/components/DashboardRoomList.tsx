import { trpc } from "../utils/trpc";
import CreateRoomCard from "./CreateRoomCard";
import WaitingRoomDashboardCard from "./WaitingRoomDashboardCard";
import { useSigninCheck } from "reactfire";
import AuthButton from "./AuthButton";
import moment from "moment";
import Spinner from "./Spinner";

export default function DashboardRoomsList() {
  const signInCheck = useSigninCheck();
  const rooms = trpc.room.readMany.useQuery(
    {},
    {
      refetchOnWindowFocus: true,
      refetchInterval: false,
      networkMode: "online",
    }
  );
  if (!signInCheck.data?.signedIn) {
    return (
      <div
        className="flex flex-col rounded-xl bg-white bg-opacity-25 p-4 py-2"
        suppressHydrationWarning
      >
        <AuthButton />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <CreateRoomCard />
        {rooms.data ? (
          rooms.data
            .sort((a, b) => moment(b.updatedAt).diff(moment(a.updatedAt)))
            .map((room) => (
              <div key={room.id} className="flex flex-row">
                <WaitingRoomDashboardCard room={room} />
              </div>
            ))
        ) : (
          <>
            <Spinner />
          </>
        )}
      </div>
    </>
  );
}
