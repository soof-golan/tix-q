import WaitingRoomEditor from "../../../../components/WaitingRoomEditor";
import { usePageContext } from "../../../../renderer/usePageContext";

export { Page };

function Page() {
  const pageContext = usePageContext();
  const id = pageContext.routeParams?.id;
  if (!id) {
    return <div>Missing id</div>;
  }
  return <WaitingRoomEditor id={id} />;
}
