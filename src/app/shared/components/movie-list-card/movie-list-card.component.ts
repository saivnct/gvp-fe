import {Component, Input, OnInit} from '@angular/core';
import {NewsInfo} from "../../models/news-info.model";
import {MEDIA_TYPE, NEWS_STATUS} from "../../models/enum";
import {NewsService} from "../../../core/services/news.service";

@Component({
  selector: 'app-movie-list-card',
  templateUrl: './movie-list-card.component.html',
  styleUrls: ['./movie-list-card.component.scss']
})
export class MovieListCardComponent implements OnInit {

  @Input('item') item: NewsInfo = {
    newsId: "",
    author: "",
    title: "",
    participants: [],
    description: "",
    catIds: [],
    tags: [],
    enableComment: true,
    previewImageInfos: [],
    mediaInfos: [],
    mediaEncKey: '',
    mediaEncIV: '',
    view: 0,
    likes: 0,
    likedByRequestedSession: false,
    rating: 0,
    ratedByRequestedSession: false,
    status: NEWS_STATUS.ACTIVED,

    weekViews: 0,
    monthViews: 0,
    currentViewsWeek: 0,
    currentViewsMonth: 0,

    weekLikes: 0,
    monthLikes: 0,
    currentLikesWeek: 0,
    currentLikesMonth: 0,
  }

  loading = true
  previewImage = "assets/images/icons/image-not-found.svg"
  constructor(private newsService: NewsService) { }

  ngOnInit(): void {
    let fileIdImage = ''
    for (let item of this.item.previewImageInfos) {
      if (item.mediaType == MEDIA_TYPE.IMAGE && item.mainPreview) {
        fileIdImage = item.fileId
        break
      } else if (item.mediaType == MEDIA_TYPE.IMAGE) {
        fileIdImage = item.fileId
      }
    }

    if (fileIdImage) {
      this.newsService.callGetFilePreSignedUrl(fileIdImage).then( response => {
        this.loading = false;
        this.previewImage = response
      })
    }

  }

}
