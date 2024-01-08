"use client";

import { pusherClient } from "@/lib/pusher";
import { cn, pusherKeyString } from "@/lib/util";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";

interface MessageProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatFriend: User;
}

const Message: FC<MessageProps> = ({
  initialMessages,
  sessionId,
  chatId,
  sessionImg,
  chatFriend,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    // Subscribe name cannot contain ":"
    pusherClient.subscribe(pusherKeyString(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      // Reverse the messages, Upside down
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming_messages", messageHandler);
    return () => {
      pusherClient.unsubscribe(pusherKeyString(`chat:${chatId}`));
      pusherClient.unbind("incoming_messages", messageHandler);
    };
    // Everything Come from outside useEffect should be dependencies
  }, [chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;
        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <div className="flex items-center">
                  {isCurrentUser && (
                    <span className="mr-2 text-xs text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  )}
                  <span
                    className={cn("px-4 py-2 rounded-lg inline-block", {
                      "bg-indigo-600 text-white": isCurrentUser,
                      "bg-gray-200 text-gray-900": !isCurrentUser,
                      "rounded-br-none":
                        !hasNextMessageFromSameUser && isCurrentUser,
                      "rounded-bl-none":
                        !hasNextMessageFromSameUser && !isCurrentUser,
                    })}
                  >
                    {message.text}
                  </span>
                  {!isCurrentUser && (
                    <span className="ml-2 text-xs text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  //Keep the space between each text
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatFriend.image
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Message;
