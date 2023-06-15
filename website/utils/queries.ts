import { prisma } from "../server/db";
import moment from "moment/moment";

const queryCache = new Map();

export async function findPublishedRooms() {
  const rooms = await prisma.waitingRoom.findMany({
    where: {
      published: true,
      AND: {
        closesAt: {
          gt: moment().subtract(1, "day").toDate(),
        },
      },
    },
    include: {
      owner: true,
    },
    orderBy: {
      closesAt: "asc",
    },
  });

  rooms.forEach((room) => {
    queryCache.set(room.id, room);
  });

  return rooms;
}

export async function findRoomById(id: string) {
  async function getRoomById() {
    return prisma.waitingRoom.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        owner: true,
      },
    });
  }

  if (queryCache.has(id)) {
    return queryCache.get(id) as Awaited<ReturnType<typeof getRoomById>>;
  }
  const room = await getRoomById();
  queryCache.set(room.id, room);
  return room;
}
