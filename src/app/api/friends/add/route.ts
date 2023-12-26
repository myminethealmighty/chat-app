import { fetchReids } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addValidator.parse(body.email);

    const idToAdd = (await fetchReids(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    {
      /* NextJS Cache Error */
    }

    /* const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );
    const data = (await RESTResponse.json()) as { result: string | null }; 
    const idToAdd = data.result; */

    if (!idToAdd) {
      return new Response("User doesn't exist.", { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized Request", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("User already exist", { status: 400 });
    }
    // Already added user

    const isAlreadyAdded = (await fetchReids(
      "sismember",
      `user"${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    const isAlreadyFriend = (await fetchReids(
      "sismember",
      `user"${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added.", { status: 400 });
    }

    if (isAlreadyFriend) {
      return new Response("Already friend.", { status: 400 });
    }
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid Request zPayload.", { status: 422 });
    }
    return new Response("Invalid Request.", { status: 400 });
  }
};
