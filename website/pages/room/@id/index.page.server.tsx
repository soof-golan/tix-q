import { findRoomById, findPublishedRooms } from "../../../utils/queries";
import { PageContextServer } from "../../../renderer/types";
import moment from "moment";
import { render } from "vite-plugin-ssr/abort";

export { onBeforeRender, prerender };

async function prerender() {
  const rooms = await findPublishedRooms();
  return rooms.map((room) => `/room/${room.id}`);
}

async function onBeforeRender(pageContext: PageContextServer) {
  const id = pageContext.routeParams.id;
  const room = await findRoomById(id);
  if (!room.published) {
    throw render(403, "Room not published");
  }

  return {
    pageContext: {
      pageProps: {
        id: room.id,
        title: room.title,
        markdown: room.markdown,
        opensAt: moment(room.opensAt).toISOString(),
        closesAt: moment(room.closesAt).toISOString(),
        ownerEmail: room.owner.email,
        mobileImageBlob: room.mobileImageBlob,
        desktopImageBlob: room.desktopImageBlob,
      },
    },
  };
}
