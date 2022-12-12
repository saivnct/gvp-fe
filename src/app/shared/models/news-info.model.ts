import { NEWS_STATUS } from "./enum";
import {PreviewImageInfo} from "./preview-image-info.model";
import {MediaInfo} from "./media-info.model";

export interface NewsInfo {
  newsId: string;
  author: string;
  title: string;
  participants: string[];
  description: string;
  catIds: string[];
  tags: string[];
  enableComment: boolean;
  previewImageInfos: PreviewImageInfo[];
  mediaInfos: MediaInfo[];
  mediaEncKey: string;
  mediaEncIV: string;
  view: number;
  likes: number;
  likedByRequestedSession: boolean;
  rating: number;
  ratedByRequestedSession: boolean;
  status: NEWS_STATUS;

  weekViews: number;
  monthViews: number;
  currentViewsWeek: number;
  currentViewsMonth: number;

  weekLikes: number;
  monthLikes: number;
  currentLikesWeek: number;
  currentLikesMonth: number;
}
