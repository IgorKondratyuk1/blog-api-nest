export type DbComment = {
  id: string;
  createdAt: Date;
  content: string;
  postId: string;
  blogId: string;
  userId: string;
  userLogin: string;
  isBanned: boolean;
};
