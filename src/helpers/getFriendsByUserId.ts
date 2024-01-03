import { fetchReids } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // Retrieved friends for current user
  const friendIs = (await fetchReids(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  // All the promises in here are called simultaneously, they don't depend on each other
  const friends = await Promise.all(
    friendIs.map(async (friendId) => {
      // friend is got as string by get request
      const friend = (await fetchReids("get", `user:${friendId}`)) as string;
      const friendJSON = JSON.parse(friend) as User;
      return friendJSON;
    })
  );
  return friends;
};
