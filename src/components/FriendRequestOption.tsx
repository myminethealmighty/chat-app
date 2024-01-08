"use client";

import { pusherClient } from "@/lib/pusher";
import { pusherKeyString } from "@/lib/util";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

interface FriendRequestOptionProps {
  initialCount: number;
  sessionId: string;
}

const FriendRequestOption: FC<FriendRequestOptionProps> = ({
  initialCount,
  sessionId,
}) => {
  const [unseenCount, setUnseenCount] = useState<number>(initialCount);

  useEffect(() => {
    // Subscribe name cannot contain ":"
    pusherClient.subscribe(
      pusherKeyString(`user:${sessionId}:incoming_friend_requests`)
    );

    pusherClient.subscribe(pusherKeyString(`user:${sessionId}:friends`));

    const friendRequestHandler = () => {
      setUnseenCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setUnseenCount((prev) => prev - 1);
    };
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);
    pusherClient.bind("new_friend", addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(
        pusherKeyString(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(pusherKeyString(`user:${sessionId}:friends`));
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
      pusherClient.unbind("new_friend", addedFriendHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-emerald-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-emerald-600 group-hover:text-emerald-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend Requests</p>
      {unseenCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-emerald-600">
          {unseenCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestOption;
