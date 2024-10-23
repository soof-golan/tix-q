import moment from "moment/moment";
import { prisma } from "../server/db";

const roomFilter = {
  published: true,
  AND: {
    closesAt: {
      gt: moment().subtract(1, "day").toDate(),
    },
  },
};

export async function findPublishedRooms() {
  return prisma.waitingRoom.findMany({
    where: roomFilter,
    include: {
      owner: true,
    },
    orderBy: {
      closesAt: "asc",
    },
  });
}

export async function findRoomById(id: string) {
  return prisma.waitingRoom.findFirst({
    where: {
      id,
      ...roomFilter,
    },
    include: {
      owner: true,
    },
  });
}
