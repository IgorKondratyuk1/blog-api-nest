export type DbBlog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  banDate: Date | null;
  banId: string | null;
  userId: string;
};

export type DbBlogExtended = DbBlog & {
  userLogin: string;
};
