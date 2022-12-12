import {Injectable} from '@angular/core';
import {
  CreateNewsRequest, DeleteNewsMediaRequest, DeleteNewsPreviewImageRequest, DeleteNewsRequest,
  GetListNewsRequest, GetListTopNewsRequest, GetManagerListNewsRequest,
  GetNewsRequest, LikeNewsRequest, RateNewsRequest, UpdateNewsInfoRequest,
  UploadNewsMediaInfo,
  UploadNewsMediaRequest, UploadNewsPreviewImageInfo, UploadNewsPreviewImageRequest
} from "./grpc/src/app/core/services/grpc/gvp-rq-res-news_pb";
import {gvpServiceClient} from "./grpc/src/app/core/services/grpc/gvp-sv_pb_service";
import {environment} from "../../../environments/environment";
import {
  LoginRequest,
  UploadUserAvatarInfo,
  UploadUserAvatarRequest
} from "./grpc/src/app/core/services/grpc/gvp-rq-res-account_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {PaginateItems} from "../../shared/models/paginate-items.model";
import {GrpcResponseService} from "./grpc-response.service";
import {NewsInfo} from "../../shared/models/news-info.model";
import {
  MEDIA_TYPE,
  VIDEO_RESOLUTION,
  MEDIA_STREAM_TYPE,
  VIDEO_RESOLUTIONMap, MEDIA_STREAM_TYPEMap, TOP_TYPEMap, TOP_TIME_TYPEMap, MEDIA_TYPEMap
} from "./grpc/src/app/core/services/grpc/gvp-model_pb";
import {DownloadFileRequest, GetFilePresignedUrlRequest} from "./grpc/src/app/core/services/grpc/gvp-rq-res-file_pb";
import {RpcOptions} from "@improbable-eng/grpc-web/dist/typings/client";
import Code = grpc.Code;
import {ParallelHasher} from "ts-md5";
import * as src_app_core_services_grpc_gvp_model_pb from "./grpc/src/app/core/services/grpc/gvp-model_pb";
import {
  CreateNewsCommentRequest, DeleteNewsCommentRequest,
  GetNewsCommentsRequest, UpdateNewsCommentRequest
} from "./grpc/src/app/core/services/grpc/gvp-rq-res-news-comments_pb";
import {NewsCommentInfo} from "../../shared/models/news-comment-info.model";
import {GetNewsParticipantsRequest} from "./grpc/src/app/core/services/grpc/gvp-rq-res-news-participants_pb";
import {GetNewsTagsRequest} from "./grpc/src/app/core/services/grpc/gvp-rq-res-news-tags_pb";
import {AuthenticationService} from "./authentication.service";
import {UserAvatarInfo} from "../../shared/models/user-avatar-info.model";

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  httpTransport = grpc.CrossBrowserHttpTransport({ withCredentials: true });
  websocketTransport = grpc.WebsocketTransport()
  fetchReadableStreamTransport = grpc.FetchReadableStreamTransport({

  })

  option: RpcOptions = {
    transport: this.websocketTransport,
    debug: true
  }
  client: gvpServiceClient  = new gvpServiceClient(environment.grpcUrl, this.option);

  hasher = new ParallelHasher('assets/scripts/md5_worker.js');

  chunkSize = 1024

  jwt = ""
  // client: gvpServiceClient  = new gvpServiceClient(environment.grpcUrl);

  constructor(private authenticationService: AuthenticationService) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser && currentUser.token) {
      this.jwt = currentUser.token
    }

    this.authenticationService.currentUser.subscribe(auth => {
      if(auth) {
        this.jwt = auth.token
      }
    })
  }

  async callCreateNews2() {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new CreateNewsRequest();
      request.setTitle("Abc")
      request.setDescription("")
      request.setParticipantsList([""])
      request.setCatidsList([""])
      request.setEnablecomment(true)
      request.setTagsList([])

      this.client.createNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo) {
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }

      });
    });
  }

  async callGetNews(newsId: string) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new GetNewsRequest();
      request.setNewsid(newsId);

      this.client.getNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          if(error.code == 7) {
            this.authenticationService.logout(true);
          }
          reject(error.message)
        }
        console.log(`get news resposne ${response}`)
        const newsInfo = response?.getNewsinfo()
        if (newsInfo) {
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }

      });
    });
  }

  async callGetListNews(page: number, pageSize: number, catIds?: string[], participants?: string[], tags?: string[], searchPhrase?: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<PaginateItems>((resolve, reject) => {

      const request = new GetListNewsRequest();
      request.setPage(page);
      request.setPagesize(pageSize);
      if (catIds) {
        request.setCatidsList(catIds)
      }
      if (participants) {
        request.setParticipantsList(participants)
      }
      if (tags) {
        request.setTagsList(tags)
      }
      if (searchPhrase) {
        request.setSearchphrase(searchPhrase)
      }

      this.client.getListNews(request, metadata, (error, response) => {
        if (error){
          console.log("receive !!!!")
          console.error(error);
          console.error(error.code);
          console.error(error.message);
          if(error.code == 7) {
            this.authenticationService.logout(true);
          }
          reject(error.message)
        }

        const totalItem = response?.getTotalitem()
        if (totalItem && totalItem > 0){
          const items = response?.getNewsinfosList().map(res => {
            return GrpcResponseService.parseGrpcNewsInfoItemResponse(res)
          });

          resolve({
            items: items,
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        } else {
          resolve({
            items: [],
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        }

      });
    });

  }

  async callGetManagerListNews(page: number, pageSize: number, catIds?: string[], participants?: string[], tags?: string[], searchPhrase?: string, author?: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<PaginateItems>((resolve, reject) => {

      const request = new GetManagerListNewsRequest();
      request.setPage(page);
      request.setPagesize(pageSize);
      if (catIds) {
        request.setCatidsList(catIds)
      }
      if (participants) {
        request.setParticipantsList(participants)
      }
      if (tags) {
        request.setTagsList(tags)
      }
      if (searchPhrase) {
        request.setSearchphrase(searchPhrase)
      }
      if (author) {
        request.setAuthor(author)
      }

      this.client.getManagerListNews(request, metadata, (error, response) => {
        if (error){
          if(error.code == 7) {
            this.authenticationService.logout(true);
          }
          reject(error.message)
        }

        const totalItem = response?.getTotalitem()
        if (totalItem && totalItem > 0){
          const items = response?.getNewsinfosList().map(res => {
            return GrpcResponseService.parseGrpcNewsInfoItemResponse(res)
          });

          resolve({
            items: items,
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        } else {
          resolve({
            items: [],
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        }

      });
    });

  }

  async callGetFilePreSignedUrl(fileId: string) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<string>((resolve, reject) => {

      const request = new GetFilePresignedUrlRequest();
      request.setFileid(fileId)

      this.client.getFilePresignedUrl(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          resolve("")
          return
        }

        const url = response?.getUrl() ?? ""

        resolve(url)
      });
    });
  }


  async callUploadNewsMedia2(file: File, hash: string) {
    const option2: RpcOptions = {
      transport: this.websocketTransport,
      debug: true
    }
    const client2: gvpServiceClient  = new gvpServiceClient(environment.grpcUrl, option2);

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>( async (resolve, reject) => {

      console.log(`Start upload file ${file.name} with size ${file.size}`)
      const filePath = "/Users/genius/Downloads/Big_Buck_Bunny_1080_10s_1MB.mp4"

      let request = new UploadNewsMediaRequest();

      const uploadNewsMediaInfo = new UploadNewsMediaInfo();
      uploadNewsMediaInfo.setNewsid("d2044b9f-1c0d-49e5-9ddc-7c22ac63b97b")
      uploadNewsMediaInfo.setFilename("Big_Buck_Bunny_720_10s_1MB.mp4")
      uploadNewsMediaInfo.setMediatype(MEDIA_TYPE.VIDEO)
      uploadNewsMediaInfo.setResolution(VIDEO_RESOLUTION.HD)
      uploadNewsMediaInfo.setChecksum(hash)
      uploadNewsMediaInfo.setMediastreamtype(MEDIA_STREAM_TYPE.BUFFERING)
      request.setUploadnewsmediainfo(uploadNewsMediaInfo);

      let streamInfo = client2.uploadNewsMedia(metadata);


      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      let amountChunks = Math.ceil(file.size / this.chunkSize);
      let fileReader = new FileReader();

      for(let offset = 0; offset < file.size; offset += this.chunkSize ){
        const chunk = file.slice(offset, offset + this.chunkSize );
        request.clearChunkData()
        const data = await chunk.arrayBuffer()
        request.setChunkData(data as Uint8Array)
        streamInfo.write(request)
      }

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)

      resolve(null)

    });
  }

  async callUploadNewsMediaByFile(newsId: string, file: File, onDemandMedia: boolean, streamType: MEDIA_STREAM_TYPEMap[keyof MEDIA_STREAM_TYPEMap], resolution: VIDEO_RESOLUTIONMap[keyof VIDEO_RESOLUTIONMap], onDemandMediaMainFileId = "") {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<string>( async (resolve, reject) => {

      let request = new UploadNewsMediaRequest();

      const hash = await this.hasher.hash(file) as string

      const uploadNewsMediaInfo = new UploadNewsMediaInfo();
      uploadNewsMediaInfo.setNewsid(newsId)
      uploadNewsMediaInfo.setFilename(file.name)
      uploadNewsMediaInfo.setMediatype(MEDIA_TYPE.VIDEO)
      uploadNewsMediaInfo.setResolution(resolution)
      uploadNewsMediaInfo.setChecksum(hash)
      uploadNewsMediaInfo.setMediastreamtype(streamType)
      uploadNewsMediaInfo.setOndemandmediamainfile(onDemandMedia)
      uploadNewsMediaInfo.setOndemandmediamainfileid(onDemandMediaMainFileId)
      request.setUploadnewsmediainfo(uploadNewsMediaInfo);

      let streamInfo = this.client.uploadNewsMedia(metadata, (error, response) => {
        //call back response message
        console.log("upload file response message")
        console.log(response)
        if (onDemandMediaMainFileId) {
          const fileId = response?.getFileid() ?? ""
          const newsInfo = response?.getNewsinfo()
          resolve(fileId)
        } else {
          resolve('')
        }
      });

      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      let amountChunks = Math.ceil(file.size / this.chunkSize);
      let fileReader = new FileReader();

      request.clearUploadnewsmediainfo()
      for(let offset = 0; offset < file.size; offset += this.chunkSize ){
        const chunk = file.slice(offset, offset + this.chunkSize );
        request.clearChunkData()
        const data = await chunk.arrayBuffer()
        request.setChunkData(data as Uint8Array)
        streamInfo.write(request)
      }

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)
    });
  }

  async callUploadNewsMediaByUrl(newsId: string, url: string, fileName: string, streamType: MEDIA_STREAM_TYPEMap[keyof MEDIA_STREAM_TYPEMap], resolution: VIDEO_RESOLUTIONMap[keyof VIDEO_RESOLUTIONMap]) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>( async (resolve, reject) => {

      let request = new UploadNewsMediaRequest();

      const uploadNewsMediaInfo = new UploadNewsMediaInfo();
      uploadNewsMediaInfo.setNewsid(newsId)
      uploadNewsMediaInfo.setFilename(fileName)
      uploadNewsMediaInfo.setMediatype(MEDIA_TYPE.VIDEO)
      uploadNewsMediaInfo.setResolution(resolution)
      uploadNewsMediaInfo.setFileurl(url)
      uploadNewsMediaInfo.setMediastreamtype(streamType)
      request.setUploadnewsmediainfo(uploadNewsMediaInfo);

      let streamInfo = this.client.uploadNewsMedia(metadata, undefined)


      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)

      resolve(null)

    });
  }

  async callUploadNewsOnDemandMedia(newsId: string, file: File, mediaEncKey: string, isMainFile: boolean, onDemandMediaMainFileId = "") {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<string>( async (resolve, reject) => {

      let request = new UploadNewsMediaRequest();

      const hash = await this.hasher.hash(file) as string
      const uploadNewsMediaInfo = new UploadNewsMediaInfo();
      uploadNewsMediaInfo.setNewsid(newsId)
      uploadNewsMediaInfo.setFilename(file.name)
      uploadNewsMediaInfo.setMediatype(MEDIA_TYPE.VIDEO)
      uploadNewsMediaInfo.setChecksum(hash)
      uploadNewsMediaInfo.setMediastreamtype(MEDIA_STREAM_TYPE.ON_DEMAND)
      uploadNewsMediaInfo.setMediaenckey(mediaEncKey)
      uploadNewsMediaInfo.setOndemandmediamainfile(isMainFile)
      if (onDemandMediaMainFileId) {
        uploadNewsMediaInfo.setOndemandmediamainfileid(onDemandMediaMainFileId)
      }
      request.setUploadnewsmediainfo(uploadNewsMediaInfo);


      let streamInfo = this.client.uploadNewsMedia(metadata, (error, response) => {
        //call back response message
        console.log("upload file response message")
        console.log(response)
        if (isMainFile) {
          const fileId = response?.getFileid() ?? ""
          const newsInfo = response?.getNewsinfo()
          resolve(fileId)
        } else {
          resolve('')
        }
      });

      console.log("do first")
      console.log(`${request.getUploadnewsmediainfo()?.getOndemandmediamainfile()} - ${request.getUploadnewsmediainfo()?.getFilename()}`)
      console.log(`${request.getUploadnewsmediainfo()?.getMediaenckey()} - ${request.getUploadnewsmediainfo()?.getMediastreamtype()}`)
      console.log(`${request.getUploadnewsmediainfo()?.getChecksum()} - ${request.getUploadnewsmediainfo()?.getNewsid()}`)

      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      const chunkSize = 1024
      let amountChunks = Math.ceil(file.size / chunkSize);
      let fileReader = new FileReader();

      for(let offset = 0; offset < file.size; offset += chunkSize ){
        const chunk = file.slice(offset, offset + chunkSize );
        request.clearChunkData()
        const data = await chunk.arrayBuffer()
        request.setChunkData(data as Uint8Array)
        streamInfo.write(request)
      }

      //send EOF
      streamInfo.end()

      console.log(`End of upload file`)

    });
  }

  async callUploadNewsPreviewImageByFile(newsId: string, file: File, mainPreview: boolean, mediaType: MEDIA_TYPEMap[keyof MEDIA_TYPEMap]) {
    console.log(`callUploadNewsPreviewImageByFile newsId ${newsId} - mainPreview ${mainPreview} - file: ${file.name}`)
    console.log(file)
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>( async (resolve, reject) => {

      let request = new UploadNewsPreviewImageRequest();

      const hash = await this.hasher.hash(file) as string

      const uploadNewsPreviewImageInfo = new UploadNewsPreviewImageInfo();
      uploadNewsPreviewImageInfo.setNewsid(newsId)
      uploadNewsPreviewImageInfo.setFilename(file.name)
      uploadNewsPreviewImageInfo.setChecksum(hash)
      uploadNewsPreviewImageInfo.setMainpreview(mainPreview)
      uploadNewsPreviewImageInfo.setMediatype(mediaType)
      request.setUploadnewspreviewimageinfo(uploadNewsPreviewImageInfo)
      let streamInfo = this.client.uploadNewsPreviewImage(metadata);


      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      let amountChunks = Math.ceil(file.size / this.chunkSize);
      let fileReader = new FileReader();

      for(let offset = 0; offset < file.size; offset += this.chunkSize ){
        const chunk = file.slice(offset, offset + this.chunkSize );
        request.clearChunkData()
        const data = await chunk.arrayBuffer()
        request.setChunkData(data as Uint8Array)
        streamInfo.write(request)
      }

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)

      resolve(null)

    });
  }

  async callUploadNewsPreviewImageByUrl(newsId: string, url: string, fileName: string, mainPreview: boolean, mediaType: MEDIA_TYPEMap[keyof MEDIA_TYPEMap]) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>( async (resolve, reject) => {

      let request = new UploadNewsPreviewImageRequest();

      const uploadNewsPreviewImageInfo = new UploadNewsPreviewImageInfo();
      uploadNewsPreviewImageInfo.setNewsid(newsId)
      uploadNewsPreviewImageInfo.setFilename(fileName)
      uploadNewsPreviewImageInfo.setFileurl(url)
      uploadNewsPreviewImageInfo.setMainpreview(mainPreview)
      uploadNewsPreviewImageInfo.setMediatype(mediaType)
      request.setUploadnewspreviewimageinfo(uploadNewsPreviewImageInfo)
      let streamInfo = this.client.uploadNewsPreviewImage(metadata);


      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)

      resolve(null)

    });
  }

  async callDeleteNewsPreviewImage(newsId: string, fileId: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new DeleteNewsPreviewImageRequest()
      request.setNewsid(newsId)
      request.setFileid(fileId)

      this.client.deleteNewsPreviewImage(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }
      });
    });
  }

  async callDeleteNewsMedia(newsId: string, fileId: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new DeleteNewsMediaRequest()
      request.setNewsid(newsId)
      request.setFileid(fileId)

      this.client.deleteNewsMedia(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }
      });
    });
  }

  async calDownloadFile(fileId: string) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<null>((resolve, reject) => {

      let request = new DownloadFileRequest();
      request.setFileid(fileId)

      let streamInfo = this.client.downloadFile(request, metadata)

      let fileData: Uint8Array[] = []
      let fileSize = 0
      let fileName = ""

      let index = 0
      streamInfo.on('data', message => {
        console.log(`On end stream file info ${index}: ${message.getFileinfo()?.getFilename()}`)
        console.log(`On end stream chunk data ${message.getChunkData()}`)
        if (index == 0) {
          //get info
          fileName = message.getFileinfo()?.getFilename() ?? "download.png"
        } else {
          //get chunk
          const chunk = message.getChunkData() as Uint8Array
          fileData.push(chunk)
          fileSize += chunk.length
        }

        index +=1

      })

      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream status ${status?.code} - ${status?.details}`)

        if (fileSize > 0) {
          let mergedArray = new Uint8Array(fileSize);
          let offset = 0;
          fileData.forEach(item => {
            mergedArray.set(item, offset);
            offset += item.length;
          });

          this.downloadBlob(mergedArray, fileName, 'application/octet-stream');

        }
      })


      console.log(`End of download file`)

      resolve(null)

    });
  }

  downloadURL = (data: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = data
    a.download = fileName
    document.body.appendChild(a)
    a.style.display = 'none'
    a.click()
    a.remove()
  }

  downloadBlob = (data: Uint8Array, fileName: string, mimeType: string) => {
    const blob = new Blob([data], {
      type: mimeType
    })

    const url = window.URL.createObjectURL(blob)

    this.downloadURL(url, fileName)

    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  }


  blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString())
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  callLogin() {
    return new Promise<any>((resolve, reject) => {

      const request = new LoginRequest();
      request.setUsername("content")
      request.setPassword("123465aA@")

      this.client.login(request, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const jwt = response?.getJwt()

        console.log(`login return jwt: ${jwt}`)

        resolve(jwt)
      });
    });
  }

  async callCreateNews(title: string, description: string, catIds: string[], participants?: string[], tags?: string[], enableComment = true) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new CreateNewsRequest()
      request.setTitle(title)
      request.setDescription(description)
      request.setCatidsList(catIds)
      request.setEnablecomment(enableComment)
      if (participants) {
        request.setParticipantsList(participants)
      }
      if (tags) {
        request.setTagsList(tags)
      }

      this.client.createNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }

      });
    });
  }

  async callUpdateNewsInfo(newsId: string, title?: string, description?: string, catIds?: string[], participants?: string[], tags?: string[], enableComment?: boolean) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new UpdateNewsInfoRequest();
      request.setNewsid(newsId)
      if (title) {
        request.setTitle(title)
      }
      if (description) {
        request.setDescription(description)
      }
      if (catIds) {
        request.setCatidsList(catIds)
      }
      if (participants) {
        request.setParticipantsList(participants)
      }
      if (tags) {
        request.setTagsList(tags)
      }
      if (enableComment != null) {
        request.setEnablecomment(enableComment)
      }

      this.client.updateNewsInfo(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }

      });
    });
  }

  async callDeleteNews(newsId: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<string>((resolve, reject) => {

      const request = new DeleteNewsRequest()
      request.setNewsid(newsId)

      this.client.deleteNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsId = response?.getNewsid() ?? ""
        resolve(newsId)
      });
    });
  }


  async callGetListTopViewNews(limit: number, topType: TOP_TYPEMap[keyof TOP_TYPEMap], topTimeType: TOP_TIME_TYPEMap[keyof TOP_TIME_TYPEMap]) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo[]>((resolve, reject) => {

      const request = new GetListTopNewsRequest();
      request.setLimit(limit)
      request.setToptype(topType)
      request.setToptimetype(topTimeType)

      this.client.getListTopNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const listItem = response?.getNewsinfosList()
        if (listItem && listItem.length > 0){
          const items = listItem.map(res => {
            return GrpcResponseService.parseGrpcNewsInfoItemResponse(res)
          });
          resolve(items)
        } else {
          resolve([])
        }

      });
    });

  }

  async callGetNewsComments(newsId: string, parentCommentId: string, page: number, pageSize: number) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<PaginateItems>((resolve, reject) => {

      const request = new GetNewsCommentsRequest()
      request.setNewsid(newsId)
      if(parentCommentId) {
        request.setParentcommentid(parentCommentId)
      }
      request.setPage(page);
      request.setPagesize(pageSize);

      this.client.getNewsComments(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const totalItem = response?.getTotalitem()
        if (totalItem && totalItem > 0){
          const items = response?.getNewscommentinfoList().map(res => {
            return GrpcResponseService.parseGrpcNewsCommentInfoItemResponse(res)
          });

          resolve({
            items: items,
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        }

      });
    });
  }

  async callCreateNewsComment(newsId: string, parentCommentId: string, content: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsCommentInfo | null>((resolve, reject) => {

      const request = new CreateNewsCommentRequest()
      request.setNewsid(newsId)
      request.setParentcommentid(parentCommentId)
      request.setContent(content)

      this.client.createNewsComment(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsCommentInfo = response?.getNewscommentinfo()
        if (newsCommentInfo){
          resolve(GrpcResponseService.parseGrpcNewsCommentInfoItemResponse(newsCommentInfo))
        } else {
          resolve(null)
        }

      });
    });
  }

  async callUpdateNewsComment(commentId: string, content: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsCommentInfo | null>((resolve, reject) => {

      const request = new UpdateNewsCommentRequest()
      request.setCommentid(commentId)
      request.setContent(content)

      this.client.updateNewsComment(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsCommentInfo = response?.getNewscommentinfo()
        if (newsCommentInfo){
          resolve(GrpcResponseService.parseGrpcNewsCommentInfoItemResponse(newsCommentInfo))
        } else {
          resolve(null)
        }

      });
    });
  }

  async callDeleteNewsComment(commentId: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<string>((resolve, reject) => {

      const request = new DeleteNewsCommentRequest()
      request.setCommentid(commentId)

      this.client.deleteNewsComment(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsCommentId = response?.getCommentid() ?? ""
        resolve(newsCommentId)
      });
    });
  }

  async callGetNewsParticipants(page: number, pageSize: number) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<PaginateItems>((resolve, reject) => {

      const request = new GetNewsParticipantsRequest();
      request.setPage(page)
      request.setPagesize(pageSize)

      this.client.getNewsParticipants(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const totalItem = response?.getTotalitem()
        if (totalItem && totalItem > 0){
          resolve({
            items: response?.getParticipantsList() ?? [],
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        }

      });
    });

  }


  async callGetNewsTags(page: number, pageSize: number) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<PaginateItems>((resolve, reject) => {

      const request = new GetNewsTagsRequest();
      request.setPage(page)
      request.setPagesize(pageSize)

      this.client.getNewsTags(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const totalItem = response?.getTotalitem()
        if (totalItem && totalItem > 0){
          resolve({
            items: response?.getTagsList() ?? [],
            page: response?.getPage() ?? 0,
            pageSize: response?.getPagesize() ?? 0,
            totalItem: response?.getTotalitem() ?? 0,
          });
        }

      });
    });

  }

  async callUploadUserAvatar(file: File) {

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<UserAvatarInfo | null>( async (resolve, reject) => {

      let request = new UploadUserAvatarRequest()

      const hash = await this.hasher.hash(file) as string
      const uploadUserAvatarInfo = new UploadUserAvatarInfo();
      uploadUserAvatarInfo.setChecksum(hash)
      request.setUploaduseravatarinfo(uploadUserAvatarInfo)
      let streamInfo = this.client.uploadUserAvatar(metadata);


      streamInfo = streamInfo.write(request)
      streamInfo.on('status', (status) => {
        console.log(`Write media on status ${status.code} - ${status.details}`)
        if (status.code == Code.OK) {

        }
      })
      streamInfo.on('end', status => {
        console.log(`On end stream ${status?.code} - ${status?.details}`)
      })

      let amountChunks = Math.ceil(file.size / this.chunkSize);
      let fileReader = new FileReader();

      for(let offset = 0; offset < file.size; offset += this.chunkSize ){
        const chunk = file.slice(offset, offset + this.chunkSize );
        request.clearChunkData()
        const data = await chunk.arrayBuffer()
        request.setChunkData(data as Uint8Array)
        streamInfo.write(request)
      }

      //send EOF
      streamInfo.end()


      console.log(`End of upload file`)

      resolve(null)

    });
  }

  async callLikeNews(newsId: string) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new LikeNewsRequest()
      request.setNewsid(newsId)

      this.client.likeNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }
      });
    });
  }

  async callRateNews(newsId: string, point: number) {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<NewsInfo | null>((resolve, reject) => {

      const request = new RateNewsRequest()
      request.setNewsid(newsId)
      request.setPoint(point)

      this.client.rateNews(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const newsInfo = response?.getNewsinfo()
        if (newsInfo){
          resolve(GrpcResponseService.parseGrpcNewsInfoItemResponse(newsInfo));
        } else {
          resolve(null)
        }
      });
    });
  }

}
