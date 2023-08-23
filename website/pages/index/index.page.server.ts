import moment from "moment";
import { findPublishedRooms } from "../../utils/queries";

export async function onBeforeRender() {
  const rooms = await findPublishedRooms();

  const pageProps = {
    rooms: rooms.map((r) => ({
      id: r.id,
      title: r.title,
      markdown: r.markdown,
      published: r.published,
      opensAt: moment(r.opensAt).utc().toISOString(),
      closesAt: moment(r.closesAt).utc().toISOString(),
    })),
  };

  return {
    pageContext: {
      pageProps,
    },
  };
}
