import { prisma } from "../../server/db";
import moment from "moment";

export async function onBeforeRender() {
  const rooms = await prisma.waitingRoom.findMany({
    where: {
      published: true,
      AND: {
        closesAt: {
          gt: moment().subtract(1, "day").toDate(),
        },
      },
    },
  });

  const pageProps = {
    rooms: rooms.map((r) => ({
      id: r.id,
      title: r.title,
      markdown: r.markdown,
      published: r.published,
      opensAt: r.opensAt,
      closesAt: r.closesAt,
    })),
  };

  return {
    pageContext: {
      pageProps,
    },
  };
}
