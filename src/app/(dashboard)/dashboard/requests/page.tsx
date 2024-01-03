import FriendRequests from "@/components/FriendRequests";
import { fetchReids } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingSenderIds = (await fetchReids(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      //This line give the JSON string
      {
        /*const sender = (await fetchReids("get", `user:${senderId}`)) as User;*/
      }

      const sender = (await fetchReids("get", `user:${senderId}`)) as string;
      const senderJson = JSON.parse(sender) as User;

      return {
        senderId,
        senderEmail: senderJson.email,
      };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <FriendRequests
        incomingFriendRequest={incomingFriendRequests}
        sessionId={session.user.id}
      />
    </main>
  );
};

export default page;
