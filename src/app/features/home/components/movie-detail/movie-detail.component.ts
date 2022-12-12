import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NewsService} from "../../../../core/services/news.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NewsInfo} from "../../../../shared/models/news-info.model";
import {MEDIA_STREAM_TYPE, MEDIA_TYPE, NEWS_STATUS, VIDEO_RESOLUTION_VALUE_MAP} from "../../../../shared/models/enum";
import * as Plyr from "plyr";
import Hls from "hls.js";
import {DomSanitizer} from "@angular/platform-browser";
import {TOP_TIME_TYPE, TOP_TYPE} from "../../../../core/services/grpc/src/app/core/services/grpc/xvp-model_pb";
import {NewsCommentInfo} from "../../../../shared/models/news-comment-info.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {Auth} from "../../../../shared/models/auth.model";
import {AuthenticationService} from "../../../../core/services/authentication.service";
import {MediaInfo} from "../../../../shared/models/media-info.model";

declare var window: any;

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit, AfterViewInit {

  loading = false;

  newsId = '';

  item: NewsInfo = {
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

  suggestLimitItem = 5
  itemsSuggestion: NewsInfo[] = [];

  comments: NewsCommentInfo[] = []
  commentPage = 0
  commentPageSize = 5
  commentTotal = 0
  loadingMoreComment = false;

  tags: string[] = [];
  participants: string[] = [];

  urlOnDemand = ""
  fileIdOnDemand = ""
  fileBuffering: MediaInfo[] = []
  thumbnailUrl = ""

  commentContent = ""

  isRateVideo = false
  ratingPoint = 0
  ratingPointByUser = 0
  isLikeVideo = false
  likePoint = 0

  @ViewChild('videoPlayer', { static: false }) previewVideoView: ElementRef = {} as ElementRef;

  auth: Auth = {
    token: '',
    expiresIn: 0,
    username: '',
    userInfo: null
  }

  constructor (private newsService: NewsService,
               private activatedRoute: ActivatedRoute,
               private router: Router,
               private nzMessageService: NzMessageService,
               private authenticationService: AuthenticationService,
               public sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {

    this.fetchSuggestionData()
    this.fetchTagsData()

    // var player = new Plyr('#plyrID', { captions: { active: true } });
    //
    // player.play()

    this.authenticationService.currentUser.subscribe(auth => {
      if(auth) {
        this.auth = auth
      }
    })

    this.activatedRoute.params.subscribe(params => {
      this.newsId = params['id']

      this.fetchListComment()

      this.newsService.callGetNews(this.newsId).then(async response => {
        if (response) {
          this.item = response
          this.participants = response.participants
          this.ratingPoint = response.rating
          this.isLikeVideo = response.likedByRequestedSession
          this.likePoint = response.likes
          this.isRateVideo = response.ratedByRequestedSession
          console.log(`get news ${response.mediaInfos.length}`)

          let isOnDemand = false
          for (let item of response.mediaInfos) {
            if (item.mediaStreamType == MEDIA_STREAM_TYPE.ON_DEMAND) {
              this.fileIdOnDemand = item.fileId
              this.urlOnDemand = await this.newsService.callGetFilePreSignedUrl(this.fileIdOnDemand)
              isOnDemand = true
              break

            } else if (item.mediaStreamType == MEDIA_STREAM_TYPE.BUFFERING) {
              this.fileBuffering.push(item)
            }
          }

          //show poster
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
            this.newsService.callGetFilePreSignedUrl(response.previewImageInfos[0].fileId).then(response => {
              this.thumbnailUrl = response
            })
          }

          if(isOnDemand) {
            this.setUpVideo(true)
          } else {
            //play buffering
            for (const fileInfo of this.fileBuffering) {
              fileInfo.fileUrl = await this.newsService.callGetFilePreSignedUrl(fileInfo.fileId)
            }
            console.log("play buffering")
            console.log(this.fileBuffering)
            this.setUpVideo(false)
          }

        } else {
          this.router.navigate(['']);
        }
      })
    })
  }

  ngAfterViewInit(): void {

    // this.setUpVideo()

  }

  setUpVideo(isOnDemand: boolean) {
    //The main idea is:
    //
    // Configure Plyr options properly to allow the switching happen.
    // Let HLS perform the quality switching, not Plyr. Hence, we only need a single source tag in video tag.
    const video = document.querySelector("video")!!;
    // const sources = video.getElementsByTagName("source");

    // const video = this.previewVideoView.nativeElement
    // let source = video.getElementsByTagName("source")[0].src;

    video.pause();
    video.currentTime = 0;
    // console.log(`number source ${sources.length}`)
    // for (let i = 0; i < sources.length; i++) {
    //   console.log(`index ${i} - type ${sources[i].type} - src ${sources[i].src}`)
    //   if (sources[i].type == "application/x-mpegURL" || sources[i].type == "vnd.apple.mpegURL") {
    //     // source = sources[i].src
    //     isM3u8 = true
    //   }
    // }

    if (!isOnDemand) {
      console.log("Play mp4")
      this.fileBuffering.forEach(fileInfo => {
        const source = document.createElement("source");
        source.setAttribute("src", fileInfo.fileUrl);
        source.setAttribute("type", "video/mp4");
        const resolution = fileInfo.resolution ?? 0
        source.setAttribute("size", VIDEO_RESOLUTION_VALUE_MAP.get(resolution) ?? '');
        // console.log(source)
        video.appendChild(source);
      })

      const defaultOptions: any = {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        enabled: true,
        muted: true,
        clickToPlay: true,
        // ads: {
        //   enabled: false,
        //   tagUrl: 'YOUR_URL'
        // },
      };
      const player = new Plyr(video, defaultOptions);

      return
    }


    console.log("Play M3u8")

    const defaultOptions: any = {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      enabled: true,
      clickToPlay: true,
      muted: true,
      // ads: {
      //   enabled: false,
      //   tagUrl: 'YOUR_URL'
      // },
    };

    if (Hls.isSupported()) {
      // For more Hls.js options, see https://github.com/dailymotion/hls.js

      console.log(`set up hsl fileId: ${this.fileIdOnDemand}`)
      console.log(`set up hsl url: ${this.urlOnDemand}`)
      // console.log(`set up hsl source: ${this.urlOnDemand}`)
      const config = {
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
              const encryptionKeyUrl = "http://localhost:9000/news/key"
              // // check for encryption key url and append only for that xhr
              if (encryptionKeyUrl !== url) {
                  return
              }
              // xhr.setRequestHeader('Authorization', jwt)
              xhr.setRequestHeader('fileId', this.fileIdOnDemand)
          }
      };

      const hls = new Hls();
      // this.urlOnDemand = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
      hls.loadSource(this.urlOnDemand);

      hls.attachMedia(video);

      // From the m3u8 playlist, hls parses the manifest and returns
      // all available video qualities. This is important, in this approach,
      // we will have one source on the Plyr player.
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {

        // Transform available levels into an array of integers (height values).
        const availableQualities = hls.levels.map((l) => l.height)

        console.log(`availableQualities ${availableQualities}`)

        // Add new qualities to option
        defaultOptions.quality = {
          default: availableQualities[0],
          options: availableQualities,
          // this ensures Plyr to use Hls to update quality level
          forced: true,
          onChange: (e: any) => this.updateQuality(e),
        }
      })

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("Events.MEDIA_ATTACHED")
        // video.autoplay = false
        // video.muted = true; //must off sound or video will not auto play
      })

      window.hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl'))  {
      // default options with no quality update in case Hls is not supported
      // const player = new Plyr(video, defaultOptions);
      console.log("Not support HLS!!!")
      video.src = this.urlOnDemand
      video.muted = true
    } else {
      const player = new Plyr(video, defaultOptions);
    }
  }

  updateQuality(newQuality: any) {
    console.log("updateQuality " + newQuality);
    window.hls.levels.forEach((level: any, levelIndex: any) => {
      if (level.height == newQuality) {
        console.log("Found quality match with " + newQuality);
        window.hls.currentLevel = levelIndex;
      }
    });
  }

  fetchSuggestionData() {
    this.newsService.callGetListTopViewNews(this.suggestLimitItem, TOP_TYPE.VIEWS, TOP_TIME_TYPE.ALL).then(response => {
      console.log(`fetchSuggestionData`)
      if (response.length > 0) {
        this.itemsSuggestion = response
      }
    })
  }

  fetchTagsData() {
    // this.newsService.callGetNewsParticipants(0, 10).then(response => {
    //   console.log(`fetchTagsData`)
    //   this.participants = response.items
    // })

    this.newsService.callGetNewsTags(0, 10).then(response => {
      console.log(`fetchTagsData`)
      this.tags = response.items
    })
  }

  onClickSuggestItem(item: NewsInfo) {
    this.router.navigate(['/watch', item.newsId]).then(r => console.log("navigate to watch id"));
  }

  onClickTag(item: string) {
    console.log(`onClickTag ${item}`)
    this.router.navigate(['/tag', item]).then(r => console.log("navigate to tag"));
  }

  onClickActor(item: string) {
    console.log(`onClickActor ${item}`)
    this.router.navigate(['/actor', item]).then(r => console.log("navigate to actor"));
  }

  fetchListComment() {
    console.log("fetchListComment")
    this.newsService.callGetNewsComments(this.newsId, "", this.commentPage, this.commentPageSize).then(response => {
      console.log(`callGetNewsComments success ${response.totalItem}`)
      console.log(response.items)
      this.comments = this.comments.concat(response.items)
      this.comments = [...this.comments]
      this.commentPage = response.page
      this.commentTotal = response.totalItem

      this.loadingMoreComment = false
    })
  }

  refreshComment() {
    console.log("refreshComment")
    this.newsService.callGetNewsComments(this.newsId, "", 0, this.commentPageSize).then(response => {
      this.comments = response.items
      this.commentPage = response.page
      this.commentTotal = response.totalItem

      this.loadingMoreComment = false
    })
  }

  sendComment(content: string) {
    this.commentContent = ""
    this.newsService.callCreateNewsComment(this.newsId, "", content).then(response => {
      console.log("callCreateNewsComment success")
      console.log(response)

      this.refreshComment()
    }, error => {
      this.nzMessageService.warning("Just sign in and comment")
    })
  }

  onLoadMoreComment(): void {
    this.loadingMoreComment = true;
    this.commentPage += 1
    this.fetchListComment()
  }

  likeVideo() {
    console.log("Like video")
    if(this.isLikeVideo) return
    this.newsService.callLikeNews(this.newsId).then(response => {
      if(response) {
        this.nzMessageService.success("You like it!")
        this.item = response
        this.isLikeVideo = true
        this.likePoint = response.likes
      }
    }, error => {
      if(error == "Already liked") {
        this.nzMessageService.warning("Already liked")
      } else {
        this.nzMessageService.warning("Just sign in to like this video")
      }
    })
  }

  rateVideo(point: number) {
    console.log("Rate point ", point)
    if(this.isRateVideo) return
    this.newsService.callRateNews(this.newsId, point).then(response => {
      if(response) {
        this.item = response
        this.isRateVideo = true
        this.ratingPoint = response.rating
        this.nzMessageService.success(`You rate ${point} stars`)
      }
    }, error => {
      if(error == "Already Voted") {
        this.nzMessageService.warning("Already voted")
      } else {
        this.nzMessageService.warning("Just sign in to rate this video")
      }
    })
  }

  onRatingHover(point: any) {
    console.log("onRatingHover ", point)
  }
}
