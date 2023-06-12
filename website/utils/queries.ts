import { prisma } from "../server/db";
import moment from "moment/moment";

export async function findPublishedRooms() {
  return prisma.waitingRoom.findMany({
    where: {
      published: true,
      AND: {
        closesAt: {
          gt: moment().subtract(1, "day").toDate(),
        },
      },
    },
    orderBy: {
      closesAt: "asc",
    },
  });
}

export async function findRoomById(id: string) {
  return prisma.waitingRoom.findUniqueOrThrow({
    where: {
      id,
    },
  });
}
