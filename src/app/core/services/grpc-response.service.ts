import {Injectable} from "@angular/core";
import {NewsInfo} from "../../shared/models/news-info.model";
import {CategoryInfo} from "../../shared/models/category-info.model";
import {PreviewImageInfo} from "./grpc/src/app/core/services/grpc/xvp-model_pb";
import {MediaInfo} from "./grpc/src/app/core/services/grpc/xvp-model_pb";
import {NewsCommentInfo} from "../../shared/models/news-comment-info.model";
import {UserInfo} from "../../shared/models/user-info.model";
import {UserAvatarInfo} from "../../shared/models/user-avatar-info.model";

@Injectable({
  providedIn: 'root'
})
export class GrpcResponseService {

  constructor() {
  }

  static parseGrpcNewsInfoItemResponse(res: any): NewsInfo {

    const previewImageInfos = res.getPreviewimageinfosList().map( (item: PreviewImageInfo) => {
      return {
        fileId: item.getFileid(),
        fileName: item.getFilename(),
        fileUrl: item.getFileurl(),
        mainPreview: item.getMainpreview(),
        checksum: item.getChecksum(),
        mediaType: item.getMediatype(),
      }
    })

    const mediaInfosList = res.getMediainfosList().map( (item: MediaInfo) => {
      return {
        fileId: item.getFileid(),
        fileName: item.getFilename(),
        fileUrl: item.getFileurl(),
        mediaType: item.getMediatype(),
        mediaStreamType: item.getMediastreamtype(),
        resolution: item.getResolution(),
        checksum: item.getChecksum(),
      }
    })


    return {
      newsId: res.getNewsid(),
      author: res.getAuthor(),
      title: res.getTitle(),
      participants: res.getParticipantsList(),
      description: res.getDescription(),
      catIds: res.getCatidsList(),
      tags: res.getTagsList(),
      enableComment: res.getEnablecomment(),
      previewImageInfos: previewImageInfos,
      mediaInfos: mediaInfosList,
      mediaEncKey: res.getMediaenckey(),
      mediaEncIV: res.getMediaenciv(),
      view: res.getView(),
      likes: res.getLikes(),
      likedByRequestedSession: res.getLikedbyrequestedsession(),
      rating: res.getRating(),
      ratedByRequestedSession: res.getRatedbyrequestedsession(),
      status: res.getStatus(),

      weekViews: res.getWeekviews(),
      monthViews: res.getMonthviews(),
      currentViewsWeek: res.getCurrentviewsweek(),
      currentViewsMonth: res.getCurrentviewsmonth(),
      weekLikes: res.getWeeklikes(),
      monthLikes: res.getMonthlikes(),
      currentLikesWeek: res.getCurrentlikesweek(),
      currentLikesMonth: res.getCurrentlikesmonth(),
    };
  }

  static parseGrpcNewsCommentInfoItemResponse(res: any): NewsCommentInfo {
    return {
      newsId: res.getNewsid(),
      commentId: res.getCommentid(),
      commentAncestors: res.getCommentancestorsList(),
      username: res.getUsername(),
      content: res.getContent(),
      commentAt: res.getCommentat(),
    };
  }

  static parseGrpcCategoryInfoItemResponse(res: any): CategoryInfo {
    return {
      catId: res.getCatid(),
      catName: res.getCatname(),
      catDescription: res.getCatdescription(),
    };
  }

  static parseGrpcUserInfoItemResponse(res: any): UserInfo {
    const avatarResponse = res.getUseravatarinfo()
    let avatar: UserAvatarInfo | undefined
    if (avatarResponse) {
      avatar = {
        fileId:  avatarResponse.getFileid() ?? "",
        fileUrl: avatarResponse.getFileurl() ?? ""
      }
    }
    return {
      username: res.getUsername(),
      email: res.getEmail(),
      role: res.getRole(),
      firstname: res.getFirstname(),
      lastname: res.getLastname(),
      userAvatarInfo: avatar,
      gender: res.getGender(),
      phoneNumber: res.getPhonenumber(),
      birthday: res.getBirthday(),
    };
  }

}
