import DashboardRoomList from "../../components/DashboardRoomList";

export { Page };

type DashboardProps = {
  children?: never;
};

function Page({}: DashboardProps) {
  return (
    <>
      <h1 className="p-4 text-center text-4xl font-bold text-white">
        Waiting Rooms
      </h1>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <DashboardRoomList />
        </div>
      </div>
    </>
  );
}
