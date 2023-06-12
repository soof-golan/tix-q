import WaitingRoomEditor from "../../../components/WaitingRoomEditor";
import { usePageContext } from "../../../renderer/usePageContext";

export { Page };

function Page() {
  const pageContext = usePageContext();
  const id = pageContext.routeParams!.id;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <WaitingRoomEditor id={id} />
      </div>
    </div>
  );
}
