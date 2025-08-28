export type User = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
};

export type Comment = {
  _id: string;
  content: string;
  author: string | { _id: string; name: string; email: string };
  parentId?: string | null;
  likesCount: number;
  createdAt: string;
};

export type Notification = {
  _id: string;
  type: 'comment' | 'reply' | 'like' | 'follow'; // ⬅️ add 'follow'
  message: string;
  toUser?: string;
  fromUser?: string | { _id: string; name: string }; // helpful for UI
  commentId?: string;
  createdAt?: string;
};

export type LoginResponse = {
  access_token: string;
  user?: User;
};
