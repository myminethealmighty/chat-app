import { fetchReids } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { pusherKeyString } from "@/lib/util";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check the sender is already friend or not
    const isAlreayFriend = await fetchReids(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );
    if (isAlreayFriend) {
      return new Response("Already Friend", { status: 400 });
    }

    const requestedInfo = await fetchReids(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!requestedInfo) {
      return new Response("No Request.", { status: 400 });
    }

    const [stringUser, stringFriend] = (await Promise.all([
      fetchReids("get", `user:${session.user.id}`),
      fetchReids("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(stringUser) as User;
    const friend = JSON.parse(stringFriend) as User;

    // Notify added user
    await Promise.all([
      pusherServer.trigger(
        pusherKeyString(`user:${idToAdd}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        pusherKeyString(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),
      //Add the user to the requester's friend list

      // No need to fetch redish due to making POST request or modifying data that is not cached in NextJS

      await db.sadd(`user:${session.user.id}:friends`, idToAdd),

      await db.sadd(`user:${idToAdd}:friends`, session.user.id),

      //Clean the friend request

      await db.srem(
        `user:${session.user.id}:incoming_friend_requests`,
        idToAdd
      ),
    ]);

    return new Response("Ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid Payload", { status: 422 });
    }

    return new Response("Invalid Request", { status: 400 });
  }
};
