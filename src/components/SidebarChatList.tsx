"use client";

import { pusherClient } from "@/lib/pusher";
import { createChatHref, pusherKeyString } from "@/lib/util";
import { usePathname, useRouter } from "next/navigation";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ToastNoti from "./ToastNoti";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ sessionId, friends }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [userChats, setUserChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(pusherKeyString(`user:${sessionId}:chats`));
    pusherClient.subscribe(pusherKeyString(`user:${sessionId}:friends`));

    const messageHandler = (message: ExtendedMessage) => {
      const notifyUser =
        pathname !==
        `/dashboard/chat/${createChatHref(sessionId, message.senderId)}`;

      if (!notifyUser) return;

      // Notify User
      toast.custom((toastNoti) => (
        <ToastNoti
          toastNoti={toastNoti}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));
      setUnseenMessages((prev) => [...prev, message]);
    };

    const friendHandler = (newFriend: User) => {
      setUserChats((prev) => [...prev, newFriend]);
    };

    pusherClient.bind("new_messages", messageHandler);
    pusherClient.bind("new_friends", friendHandler);

    return () => {
      pusherClient.unsubscribe(pusherKeyString(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(pusherKeyString(`user:${sessionId}:friends`));

      pusherClient.unbind("new_messages", messageHandler);
      pusherClient.unbind("new_friends", friendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((message) => !pathname.includes(message.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h- [25rem] overflow-y-auto -mx-2 space-y-1">
      {userChats.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter((unseenMessage) => {
          return unseenMessage.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${createChatHref(sessionId, friend.id)}`}
              className="text-gray-700 hover:text-emerald-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessageCount > 0 ? (
                <div className="bg-emerald-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessageCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
