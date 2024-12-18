import moment from "moment";
import { useSigninCheck } from "reactfire";
import { trpc } from "../utils/trpc";
import AuthButton from "./AuthButton";
import CreateRoomCard from "./CreateRoomCard";
import Spinner from "./Spinner";
import WaitingRoomDashboardCard from "./WaitingRoomDashboardCard";

export default function DashboardRoomsList() {
  const signInCheck = useSigninCheck();
  const { data } = trpc.room.readMany.useQuery(
    {},
    {
      refetchOnWindowFocus: true,
      refetchInterval: false,
      networkMode: "online",
    },
  );
  const rooms = data?.map((room) => ({
    ...room,
    opensAt: moment(room.opensAt).utc(true).local(),
    closesAt: moment(room.closesAt).utc(true).local(),
  }));

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
        {rooms ? (
          rooms.map((room) => (
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
