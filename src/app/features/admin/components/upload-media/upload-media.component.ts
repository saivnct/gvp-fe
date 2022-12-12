import { Component, OnInit } from '@angular/core';
import {NzUploadFile} from "ng-zorro-antd/upload/interface";
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {NewsService} from "../../../../core/services/news.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {FormBuilder, FormControl} from "@angular/forms";
import {VIDEO_RESOLUTION, MEDIA_STREAM_TYPE, MEDIA_TYPE} from "../../../../core/services/grpc/src/app/core/services/grpc/xvp-model_pb";
import {UPLOAD_TYPE} from "../../../../shared/models/enum";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-upload-media',
  templateUrl: './upload-media.component.html',
  styleUrls: ['./upload-media.component.scss']
})
export class UploadMediaComponent implements OnInit {

  uploading = false;
  fileList: NzUploadFile[] = [];

  uploadForm = this.fb.group({});
  controlArray: Array<{
    control: string;
    controlName: string;
    placeholder: string;
    show: boolean,
    type: string
  }> = [];

  controlResolutionArray: Array<{
    control: string;
    controlName: string;
    placeholder: string;
    show: boolean,
    type: string
  }> = [];

  controlMainFileArray: Array<{
    control: string;
    controlName: string;
    placeholder: string;
    show: boolean,
    type: string
  }> = [];

  uploadTypes = {
    MEDIA_VIDEO_LOCAL: UPLOAD_TYPE.MEDIA_VIDEO_LOCAL,
    MEDIA_VIDEO_URL: UPLOAD_TYPE.MEDIA_VIDEO_URL,
    PREVIEW_IMAGE_LOCAL: UPLOAD_TYPE.PREVIEW_IMAGE_LOCAL,
    PREVIEW_IMAGE_URL: UPLOAD_TYPE.PREVIEW_IMAGE_URL
  }

  resolutions = {
    NONE_RESOLUTION: VIDEO_RESOLUTION.NONE_RESOLUTION,
    SD_L_240p: VIDEO_RESOLUTION.SD_L,
    SD_M_360p: VIDEO_RESOLUTION.SD_M,
    SD_480p: VIDEO_RESOLUTION.SD,
    HD_720p: VIDEO_RESOLUTION.HD,
    FHD_1080p: VIDEO_RESOLUTION.FHD,
    FHD_H_2K: VIDEO_RESOLUTION.FHD_H,
    QHD_1440p: VIDEO_RESOLUTION.QHD,
    UHD_4K: VIDEO_RESOLUTION.UHD,
    FUHD_8K: VIDEO_RESOLUTION.FUHD,
  }

  streamTypes = {
    UNKNOWN: MEDIA_STREAM_TYPE.UNKNOWN_STREAM_TYPE,
    BUFFERING: MEDIA_STREAM_TYPE.BUFFERING,
    ON_DEMAND: MEDIA_STREAM_TYPE.ON_DEMAND,
  }

  mediaTypes = {
    NONE: MEDIA_TYPE.NONE_MEDIA_TYPE,
    VIDEO: MEDIA_TYPE.VIDEO,
    AUDIO: MEDIA_TYPE.AUDIO,
    IMAGE: MEDIA_TYPE.IMAGE,
  }

  newsId = ""
  isLoading = false
  tipLoading = ""

  constructor(private newsService: NewsService,
              private nzMessageService: NzMessageService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.newsId = this.activatedRoute.snapshot.paramMap.get('id') ?? ''
    const uploadType = this.activatedRoute.snapshot.queryParamMap.get('uploadType');

    console.log(`newsID !!! ${this.newsId}`)
    this.controlArray.push({ control: 'uploadType', controlName: 'Upload Type', placeholder: 'Select', show: true, type: 'selectUpload' });
    this.uploadForm.addControl('uploadType', new FormControl());
    this.controlArray.push({ control: 'streamType', controlName: 'Stream Type', placeholder: 'Select', show: false, type:'selectStream' });
    this.uploadForm.addControl('streamType', new FormControl());
    this.controlArray.push({ control: 'fileUrl', controlName: 'File URL', placeholder: 'String', show: false, type: 'input' });
    this.uploadForm.addControl('fileUrl', new FormControl());
    this.controlArray.push({ control: 'mainPreview', controlName: 'Main Preview', placeholder: 'String', show: false, type: 'checkboxMainPreview' });
    this.uploadForm.addControl('mainPreview', new FormControl());
    this.controlArray.push({ control: 'mediaEncKey', controlName: 'Media Enc Key', placeholder: 'String', show: false, type: 'input' });
    this.uploadForm.addControl('mediaEncKey', new FormControl());
    this.controlArray.push({ control: "resolution", controlName: 'Resolution', placeholder: 'Select', show: false, type:'selectResolution' });
    this.uploadForm.addControl("resolution", new FormControl());
    this.controlArray.push({ control: 'fileName', controlName: 'File Name', placeholder: 'String', show: false, type: 'input' });
    this.uploadForm.addControl('fileName', new FormControl());
    this.controlArray.push({ control: 'mediaType', controlName: 'Media Type', placeholder: 'Select', show: false, type: 'selectMediaType' });
    this.uploadForm.addControl('mediaType', new FormControl());

    this.uploadForm.valueChanges.subscribe(
      result => {
        console.log(result)
        if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.MEDIA_VIDEO_LOCAL) {
          this.resetFormState()

          this.controlArray[1].show = true

          if (this.uploadForm.get('streamType')?.value == this.streamTypes.BUFFERING) {

          } else if (this.uploadForm.get('streamType')?.value == this.streamTypes.ON_DEMAND) {
            this.controlArray[4].show = true
          }

        } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.MEDIA_VIDEO_URL) {
          this.resetFormState()

          this.controlArray[1].show = true
          this.controlArray[2].show = true
          this.controlArray[6].show = true
          if (this.uploadForm.get('streamType')?.value == this.streamTypes.BUFFERING) {
            this.controlArray[5].show = true
          } else if (this.uploadForm.get('streamType')?.value == this.streamTypes.ON_DEMAND) {
            this.controlArray[4].show = true
          }

        } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.PREVIEW_IMAGE_LOCAL) {
          this.resetFormState()

        } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.PREVIEW_IMAGE_URL) {
          this.resetFormState()

          this.controlArray[2].show = true
          this.controlArray[3].show = true
          this.controlArray[6].show = true
          this.controlArray[7].show = true
        }
      }
    );

    if (uploadType) {
      this.uploadForm.patchValue({
        uploadType: uploadType
      });
    }

  }

  resetFormState() {
    this.controlArray.forEach( (item, index) => {
      if (index > 0) {
        item.show = false
      }
    })
  }

  clearSelectedFiles() {
    this.controlResolutionArray = []
    this.controlMainFileArray = []
    this.fileList.forEach((file, index) => {
      this.uploadForm.removeControl(`resolution_${index}`)
      this.uploadForm.removeControl(`mainFile_${index}`)
      this.uploadForm.removeControl(`mediaType_${index}`)
    })
    this.fileList = []
  }

  get f() { return this.uploadForm.controls; }

  get fUploadType() { return this.uploadForm.get('uploadType'); }
  get fStreamType() { return this.uploadForm.get('streamType'); }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    console.log("upload handleChange");
    console.log(file.originFileObj);
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file.name, fileList.length);
    }
    if (status === 'done') {
      this.nzMessageService.success(`${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.nzMessageService.error(`${file.name} file upload failed.`);
    }
  }

  handleUploadAction(file: NzUploadFile): string {
    console.log("handleUploadAction");
    return "abc"
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    console.log(`beforeUpload ${file.name} - size ${file.size}`);
    console.log(file);
    // file['resolution'] = 3
    // console.log(`beforeUpload reso ${file['resolution']}`);
    //return false for manual upload
    // file.status='uploading'

    this.controlResolutionArray.push({ control: `resolution_${this.fileList.length}`, controlName: 'Resolution', placeholder: 'Select', show: true, type:'selectResolution' });
    this.uploadForm.addControl(`resolution_${this.fileList.length}`, new FormControl());
    this.controlResolutionArray.push({ control: `mainFile_${this.fileList.length}`, controlName: 'Main File', placeholder: 'Checkbox', show: true, type:'checkBoxMainFile' });
    this.uploadForm.addControl(`mainFile_${this.fileList.length}`, new FormControl());
    this.controlResolutionArray.push({ control: `mediaType_${this.fileList.length}`, controlName: 'Media Type', placeholder: 'Select', show: true, type:'selectMediaType' });
    this.uploadForm.addControl(`mediaType_${this.fileList.length}`, new FormControl());

    // this.uploadForm.get(`resolution_${this.fileList.length}`)?.updateValueAndValidity()
    this.fileList = this.fileList.concat(file);
    // this.fileList.push(file)
    return false
  };

  async doUpload() {

    const newsId = this.newsId
    const streamType = this.uploadForm.get('streamType')?.value

    console.log(`do upload newsId ${newsId} - upload type ${this.uploadForm.get('uploadType')?.value}`)

    if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.MEDIA_VIDEO_LOCAL) {
      if (streamType == this.streamTypes.BUFFERING) {

        const totalFile = this.fileList.length
        this.isLoading = true
        for (let index = 0; index < this.fileList.length; index++) {
          this.tipLoading = `Upload File ${index + 1}/${totalFile}. ${this.fileList[index].filename}`

          const resolution = this.uploadForm.get(`resolution_${index}`)?.value ?? 0
          const file = this.fileList[index] as unknown as File
          await this.newsService.callUploadNewsMediaByFile(newsId, file!, false, MEDIA_STREAM_TYPE.BUFFERING, resolution)
        }
        this.isLoading = false
        this.nzMessageService.success("Upload success")


      } else if (streamType == this.streamTypes.ON_DEMAND) {
        console.log("upload on demand")
        const mediaEncKey = this.uploadForm.get("mediaEncKey")?.value ?? ""
        let mainFileId = ""

        this.fileList.forEach((uploadFile, index) => {
          const isMainFile = this.uploadForm.get(`mainFile_${index}`)?.value ?? false
          if (isMainFile) {
            const mainFile = uploadFile as unknown as File
            if (mainFile) {
              console.log("Detect main File ~~~")
              this.isLoading = true
              this.tipLoading = `Upload Main File: ${mainFile.name}`
              this.newsService.callUploadNewsOnDemandMedia(newsId, mainFile, mediaEncKey, true).then(async response => {
                mainFileId = response
                console.log(`Upload main file success ${mainFileId}. Do loop`)
                const totalFile = this.fileList.length

                for (let index = 0; index < this.fileList.length; index++) {
                  const file = this.fileList[index] as unknown as File
                  const checkMainFile = this.uploadForm.get(`mainFile_${index}`)?.value ?? false
                  // console.log(`${index}. ${file.name} - main file ${mainFile}`)
                  if (!checkMainFile) {
                    this.tipLoading = `Upload File ${index + 1}/${totalFile - 1}. ${this.fileList[index].filename}`
                    await this.newsService.callUploadNewsOnDemandMedia(newsId, file, mediaEncKey, false, mainFileId)

                    //upload main file first
                    if (index == totalFile - 2) {
                      this.isLoading = false
                      this.nzMessageService.success("Upload success")
                    }
                  }
                }

              })

            }
          }
        })


      }


    } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.MEDIA_VIDEO_URL) {
      const fileName = this.uploadForm.get('fileName')?.value ?? ""
      const fileUrl = this.uploadForm.get('fileUrl')?.value ?? ""
      const resolution = this.uploadForm.get('resolution')?.value ?? 0
      const streamType = this.uploadForm.get('streamType')?.value ?? 0
      this.isLoading = true
      this.tipLoading = `Upload Media file ${fileName}`
      await this.newsService.callUploadNewsMediaByUrl(newsId, fileUrl, fileName, streamType, resolution)
      this.isLoading = false
      this.nzMessageService.success("Upload success")

    } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.PREVIEW_IMAGE_LOCAL) {
      console.log(`do upload PREVIEW_IMAGE_LOCAL list size ${this.fileList.length}`)
      const totalFile = this.fileList.length
      this.isLoading = true
      for (let index = 0; index < this.fileList.length; index++) {
        const file = this.fileList[index] as unknown as File
        this.tipLoading = `Upload ${index + 1}/${totalFile} File ${file.name}. ${this.fileList[index].filename}`
        const isMainFile = this.uploadForm.get(`mainFile_${index}`)?.value ?? false
        const mediaType = this.uploadForm.get(`mediaType_${index}`)?.value ?? 0
        await this.newsService.callUploadNewsPreviewImageByFile(newsId, file, isMainFile, mediaType)
      }
      this.isLoading = false
      this.nzMessageService.success("Upload success")

    } else if (this.uploadForm.get('uploadType')?.value == this.uploadTypes.PREVIEW_IMAGE_URL) {
      const fileName = this.uploadForm.get('fileName')?.value ?? ""
      const fileUrl = this.uploadForm.get('fileUrl')?.value ?? ""
      const mainPreview = this.uploadForm.get('mainPreview')?.value ?? false
      const mediaType = this.uploadForm.get('mediaType')?.value ?? 0

      this.isLoading = true
      this.tipLoading = `Upload Preview Image File ${fileName}`
      await this.newsService.callUploadNewsPreviewImageByUrl(newsId, fileUrl, fileName, mainPreview, mediaType)
      this.isLoading = false
      this.nzMessageService.success("Upload success")
    }


  }

  deleteSelectFile(file: NzUploadFile) {
    this.fileList.forEach( (item, index) => {
      if (item === file) this.fileList.splice(index,1);
    });
  }

  //keep order
  unsorted = (a: any, b: any) => {
    return a;
  }

}
