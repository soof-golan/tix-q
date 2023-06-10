import type { PageContext } from "../../renderer/types";
import { prisma } from "../../server/db";
import moment from "moment";

export async function onBeforeRender(pageContext: PageContext) {
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
    rooms,
  };

  return {
    pageContext: {
      pageProps,
    },
  };
}
