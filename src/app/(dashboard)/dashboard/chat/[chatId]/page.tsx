import Messages from "@/components/Messages";
import SendMessages from "@/components/SendMessages";
import { fetchReids } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    chatId: string;
  };
}

const getChatMessages = async (chatId: string) => {
  try {
    // result is JSON string that is needed to parse
    const results: string[] = await fetchReids(
      "zrange",
      `chat:${chatId}:messages`,
      // Fetch all messages 0, -1
      0,
      -1
    );

    const dbMessages = results.map((result) => JSON.parse(result) as Message);

    //Reverse Messages by time order

    const messagesByOrder = dbMessages.reverse();
    const messages = messageArrayValidator.parse(messagesByOrder);

    return messages;
  } catch (error) {
    notFound();
  }
};

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;
  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatFriendId = user.id === userId1 ? userId2 : userId1;

  // No caching issue, so use db.get instead of fetchRedis
  const chatFriendString = (await fetchReids(
    "get",
    `user:${chatFriendId}`
  )) as string;
  const chatFriend = JSON.parse(chatFriendString) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatFriend.image}
                alt={`${chatFriend.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatFriend.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">{chatFriend.email}</span>
          </div>
        </div>
      </div>

      <Messages
        chatId={chatId}
        chatFriend={chatFriend}
        sessionImg={session.user.image}
        sessionId={session.user.id}
        initialMessages={initialMessages}
      />
      <SendMessages chatId={chatId} chatFriend={chatFriend} />
    </div>
  );
};

export default page;
