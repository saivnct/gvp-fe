import { Component, OnInit } from '@angular/core';
import {NewsInfo} from "../../../../shared/models/news-info.model";
import {NewsService} from "../../../../core/services/news.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {Md5, ParallelHasher} from 'ts-md5';
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {NzUploadFile} from "ng-zorro-antd/upload/interface";
import {Router} from "@angular/router";
import {UPLOAD_TYPE} from "../../../../shared/models/enum";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  //region init table
  items: NewsInfo[] = [];

  currentPage = 0;
  pageSize = 5;
  loadingTable = false;
  totalItem = 0;

  expandSet = new Set<number>();
  //endregion init table

  //region modal
  isModalInfoVisible = false;
  modalInfoTitle = '';
  modalInfoContent = ''
  modalType = ''

  uploading = false;
  fileList: NzUploadFile[] = [];

  //endregion modal

  constructor(private newsService: NewsService,
              private nzMessageService: NzMessageService,
              private modalService: NzModalService,
              private router: Router) { }

  ngOnInit(): void {
    this.fetchData();
  }

  //region table
  fetchData() {
    this.loadingTable = true;
    this.newsService.callGetManagerListNews(this.currentPage, this.pageSize).then(response => {
      // console.log(response)
      this.loadingTable = false;

      this.items = response.items;

      this.currentPage = response.page;
      this.pageSize = response.pageSize;
      this.totalItem = response.totalItem;

    }, error => {
      this.loadingTable = false;
      // console.error(error)
      this.nzMessageService.error("Fetch data fail");
    });
  }

  onPageIndexChange(page: number) {
    // console.log(`onPageIndexChange ${page}`)
    this.currentPage = page - 1;
    this.fetchData()
  }

  onPageSizeChange(pageSize: number) {
    // console.log(`onPageSizeChange ${pageSize}`)
    this.pageSize = pageSize;
    this.fetchData();
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  //endregion table


  //region filter


  searchByAddress() {
    this.fetchData();
  }
  //endregion filter

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    console.log(`file selected ${file.name}`)
    console.log(`file size ${file.size}`)

    const hasher = new ParallelHasher('assets/scripts/md5_worker.js');
    hasher.hash(file).then(result => {
      console.log('md5 of fileBlob is', result);
      const hash = result as string
      this.newsService.callUploadNewsMedia2(file, hash).then()
    });


  }

  onClickTest() {
    // this.newsService.calDownloadFile("c43785a1-0021-4907-a310-4b5943b7bfc5-5a3da73525c6aad43a79d8847af5e87a").then()
    const id = "4b1df48b-af19-4cbe-817c-65cd09aef613"
    // this.router.navigate(['/admin/news', id, "preview-image-info"]).then()
    this.router.navigate(['/admin/news', id, "media-info"]).then()
  }

  //region modal
  showModalInfo(): void {
    this.isModalInfoVisible = true;
  }

  handleModalInfoOk(): void {
    this.isModalInfoVisible = false;
  }

  handleModalInfoCancel(): void {
    this.isModalInfoVisible = false;
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    console.log("upload handleChange");
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
    console.log(`beforeUpload ${file.name}`);
    //return false for manual upload
    file.status='uploading'
    this.fileList = this.fileList.concat(file);
    return false;
  };
  //endregion modal

  doCreateNews() {
    this.router.navigate(['/admin/news', 'edit', 'create']).then()
  }

  viewPreviewImageInfo(newsId: string) {
    this.router.navigate(['/admin/news', newsId, 'preview-image-info']).then()
  }

  viewMediaInfo(newsId: string) {
    this.router.navigate(['/admin/news', newsId, 'media-info']).then()
  }

  updateNewsInfo(item: NewsInfo) {
    this.router.navigate(['/admin/news', 'edit', item.newsId]).then()
  }

  uploadMediaInfoLocal(item: NewsInfo) {
    this.router.navigate(['/admin/news', 'upload', item.newsId], {queryParams: {uploadType: UPLOAD_TYPE.MEDIA_VIDEO_LOCAL}}).then()
  }

  uploadMediaInfoUrl(item: NewsInfo) {
    this.router.navigate(['/admin/news', 'upload', item.newsId], {queryParams: {uploadType: UPLOAD_TYPE.MEDIA_VIDEO_URL}}).then()
  }

  uploadPreviewImageLocal(item: NewsInfo) {
    this.router.navigate(['/admin/news', 'upload', item.newsId], {queryParams: {uploadType: UPLOAD_TYPE.PREVIEW_IMAGE_LOCAL}}).then()
  }

  uploadPreviewImageUrl(item: NewsInfo) {
    this.router.navigate(['/admin/news', 'upload', item.newsId], {queryParams: {uploadType: UPLOAD_TYPE.PREVIEW_IMAGE_URL}}).then()
  }

  deleteNews(item: NewsInfo) {
    this.modalService.confirm({
      nzTitle: 'Confirm',
      nzContent: `Delete News ${item.newsId} ?`,
      nzOkText: 'OK',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.newsService.callDeleteNews(item.newsId).then(response => {
          if (response) {
            this.nzMessageService.success("Delete news success")
            this.fetchData()
          } else {
            this.nzMessageService.error("Delete news failed")
          }
        }, (error) => {
          this.nzMessageService.error(error)
        })
      }
    });

  }
}
