export type DbPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  userId: string;
  createdAt: Date;
  isBanned: boolean;
};
