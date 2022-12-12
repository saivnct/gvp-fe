export interface NewsCommentInfo {
  newsId: string;
  commentId: string;
  commentAncestors: string[];
  username: boolean;
  content: string;
  commentAt: number;
}
