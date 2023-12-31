interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Chat {
  id: string;
  message: Message[];
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  text: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
