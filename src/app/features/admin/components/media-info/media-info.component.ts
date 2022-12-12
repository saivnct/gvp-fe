import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NewsService} from "../../../../core/services/news.service";
import {MediaInfo} from "../../../../shared/models/media-info.model";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {
  items: MediaInfo[] = []
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
          this.items = response.mediaInfos
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

  deleteMediaInfo(item: MediaInfo) {
    this.modalService.confirm({
      nzTitle: 'Confirm',
      nzContent: `Delete Item ${item.fileName} ?`,
      nzOkText: 'OK',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.newsService.callDeleteNewsMedia(this.newsId, item.fileId).then(response => {
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
