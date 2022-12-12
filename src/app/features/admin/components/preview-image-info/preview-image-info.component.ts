import { Component, OnInit } from '@angular/core';
import {PreviewImageInfo} from "../../../../shared/models/preview-image-info.model";
import {NewsService} from "../../../../core/services/news.service";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-preview-image-info',
  templateUrl: './preview-image-info.component.html',
  styleUrls: ['./preview-image-info.component.scss']
})
export class PreviewImageInfoComponent implements OnInit {
  items: PreviewImageInfo[] = []
  loadingTable = false;
  totalItem = 0;

  expandSet = new Set<number>();

  newsId = ""

  constructor(private newsService: NewsService,
              private modalService: NzModalService,
              private nzMessageService: NzMessageService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.newsId = this.activatedRoute.snapshot.paramMap.get('id') ?? ''
    console.log(`call get news ${this.newsId}`)
    this.fetchData()
  }

  fetchData() {
    if (this.newsId) {
      this.newsService.callGetNews(this.newsId).then(response => {
        console.log(`response ${response}`)
        if (response) {
          this.items = response.previewImageInfos
          this.totalItem = this.items.length
        }
      })
    }
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  deleteImage(item: PreviewImageInfo) {
    this.modalService.confirm({
      nzTitle: 'Confirm',
      nzContent: `Delete Item ${item.fileName} ?`,
      nzOkText: 'OK',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.newsService.callDeleteNewsPreviewImage(this.newsId, item.fileId).then(response => {
          if (response) {
            this.nzMessageService.success("Delete item success")
            this.fetchData()
          } else {
            this.nzMessageService.error("Delete item failed")
          }
        }, (error) => {
          this.nzMessageService.error(error)
        })
      }
    });
  }
}

