"use client";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequest: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequest,
  sessionId,
}) => {
  const [incomingRequest, setIncomingRequest] = useState<
    IncomingFriendRequest[]
  >(incomingFriendRequest);

  const router = useRouter();

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });
    //Put into state and refresh the page
    setIncomingRequest((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });

    setIncomingRequest((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  return (
    <>
      {incomingRequest.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        incomingRequest.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              aria-label="Accept"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => denyFriend(request.senderId)}
              aria-label="Reject"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
