import DashboardRoomList from "../../components/DashboardRoomList";

export { Page };

function Page() {
  return (
    <>
      <h1 className="p-4 text-center font-bold text-4xl text-white">
        Waiting Rooms
      </h1>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <DashboardRoomList />
        </div>
      </div>
    </>
  );
}
