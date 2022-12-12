import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {NewsInfo} from "../../models/news-info.model";
import {MEDIA_TYPE, NEWS_STATUS} from "../../models/enum";
import {NewsService} from "../../../core/services/news.service";

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit, AfterViewInit {

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

  loading = true;

  @ViewChild('videoPlayer', { static: false }) previewVideoView: ElementRef = {} as ElementRef;
  previewVideo: any
  previewTimeout: any

  previewImage = "assets/images/icons/image-not-found.svg"
  previewVideoSource = ""

  constructor(private newsService: NewsService) {
    // setTimeout(() => {
    //   this.loading = false;
    // }, 1000);
  }

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

  ngAfterViewInit(): void {
    this.previewVideo = this.previewVideoView.nativeElement
    // this.previewVideo.src = URL.createObjectURL(yourBlob);
    // this.previewVideo.play();
  }

  startPreview() {
    if (this.previewVideo) {
      this.previewVideo.muted = true;
      this.previewVideo.autoplay = true
      this.previewVideo.controls = false
      this.previewVideo.playsInline = true
      this.previewVideo.play();
    }
  }

  stopPreview() {
    if (this.previewVideo) this.previewVideo.pause();
  }

  mouseenter() {
    console.log("mouseenter")
    if (this.previewVideoSource) {
      this.startPreview();
      this.previewTimeout = setTimeout(this.stopPreview, 4000);
    } else {
      let fileIdVideo = ''
      for (let item of this.item.previewImageInfos) {
        if (item.mediaType == MEDIA_TYPE.VIDEO) {
          fileIdVideo = item.fileId
          break
        }
      }
      if (fileIdVideo) {
        this.newsService.callGetFilePreSignedUrl(fileIdVideo).then( response => {
          console.log(`previewVideoSource ${response} - ${this.item.title}`)

          this.previewVideoSource = response

          this.previewVideo.src = this.previewVideoSource
          this.previewVideo.load()

          this.startPreview();
          this.previewTimeout = setTimeout(this.stopPreview, 4000);
        })
      }
    }
  }

  mouseleave() {
    clearTimeout(this.previewTimeout);
    this.previewTimeout = null;
    this.stopPreview();
  }

}
