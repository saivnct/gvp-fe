import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NewsService} from "../../../../core/services/news.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {FormBuilder, FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {NewsInfo} from "../../../../shared/models/news-info.model";

@Component({
  selector: 'app-edit-news',
  templateUrl: './edit-news.component.html',
  styleUrls: ['./edit-news.component.scss']
})
export class EditNewsComponent implements OnInit {

  modes = {
    CREATE: 1,
    UPDATE: 2,
  }
  newsId = ""

  currentMode = this.modes.CREATE

  form = this.fb.group({});
  controlArray: Array<{
    control: string;
    controlName: string;
    placeholder: string;
    show: boolean,
    type: string
  }> = [];

  catIds: string[] = []
  participants: string[] = []
  tags: string[] = []

  inputCatIdVisible = false
  inputParticipantVisible = false;
  inputTagVisible = false;

  @ViewChild('inputCatIdElement', { static: false }) inputCatIdElement?: ElementRef;
  @ViewChild('inputParticipantElement', { static: false }) inputParticipantElement?: ElementRef;
  @ViewChild('inputTagElement', { static: false }) inputTagElement?: ElementRef;

  isLoading = false

  constructor(private newsService: NewsService,
              private nzMessageService: NzMessageService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.newsId = this.activatedRoute.snapshot.paramMap.get('id') ?? ''
    this.currentMode = (this.newsId && this.newsId != 'create') ? this.modes.UPDATE : this.modes.CREATE

    this.controlArray.push({ control: 'title', controlName: 'Title', placeholder: 'String', show: true, type: 'input' });
    this.form.addControl('title', new FormControl());
    this.controlArray.push({ control: 'description', controlName: 'Description', placeholder: 'String', show: true, type: 'input' });
    this.form.addControl('description', new FormControl());
    this.controlArray.push({ control: 'catId', controlName: 'Category IDs', placeholder: 'List', show: true, type: 'listCatId' });
    this.form.addControl('catId', new FormControl());
    this.controlArray.push({ control: 'participant', controlName: 'Participants', placeholder: 'List', show: true, type: 'listParticipant' });
    this.form.addControl('participant', new FormControl());
    this.controlArray.push({ control: 'tag', controlName: 'Tags', placeholder: 'List', show: true, type: 'listTag' });
    this.form.addControl('tag', new FormControl());
    this.controlArray.push({ control: 'enableComment', controlName: 'Enable Comment', placeholder: 'String', show: true, type: 'checkbox' });
    this.form.addControl('enableComment', new FormControl());

    if (this.currentMode == this.modes.UPDATE) {
      this.newsService.callGetNews(this.newsId).then(response => {
        this.setNewsInfo(response)
      })
    }
  }

  handleClose(removedItem: {}, type: string): void {
    switch (type) {
      case 'listCatId':
        this.catIds = this.catIds.filter(id => id !== removedItem);
        break
      case 'listParticipant':
        this.participants = this.participants.filter(id => id !== removedItem);
        break;
      case 'listTag':
        this.tags = this.tags.filter(id => id !== removedItem);
        break;
      default:
        break
    }
  }

  sliceText(content: string): string {
    // const isLongText = content.length > 20;
    // return isLongText ? `${content.slice(0, 20)}...` : content;
    return content
  }

  showInput(type: string) {
    switch (type) {
      case 'listCatId':
        this.inputCatIdVisible = true;
        setTimeout(() => {
          this.inputCatIdElement?.nativeElement.focus();
        }, 10);
        break
      case 'listParticipant':
        this.inputParticipantVisible = true;
        setTimeout(() => {
          this.inputParticipantElement?.nativeElement.focus();
        }, 10);
        break;
      case 'listTag':
        this.inputTagVisible = true;
        setTimeout(() => {
          this.inputTagElement?.nativeElement.focus();
        }, 10);
        break;
      default:
        break
    }
  }

  handleInputConfirm(type: string): void {
    switch (type) {
      case 'listCatId':
        const inputCatId = this.form.get('catId')?.value ?? ""
        if (inputCatId && this.catIds.indexOf(inputCatId) === -1) {
          this.catIds = [...this.catIds, inputCatId];
        }
        this.form.patchValue({
          catId: ''
        });
        this.inputCatIdVisible = false;
        break

      case 'listParticipant':
        const inputParticipant = this.form.get('participant')?.value ?? ""
        if (inputParticipant && this.participants.indexOf(inputParticipant) === -1) {
          this.participants = [...this.participants, inputParticipant];
        }
        this.form.patchValue({
          participant: ''
        });
        this.inputParticipantVisible = false;
        break

      case 'listTag':
        const inputTag = this.form.get('tag')?.value ?? ""
        if (inputTag && this.tags.indexOf(inputTag) === -1) {
          this.tags = [...this.tags, inputTag];
        }
        this.form.patchValue({
          tag: ''
        });
        this.inputTagVisible = false;
        break

      default:
        break
    }
  }

  setNewsInfo(newsInfo: NewsInfo | null) {
    this.form.patchValue({
      title: newsInfo?.title ?? '',
      description: newsInfo?.description ?? '',
      enableComment: newsInfo?.enableComment ?? '',
    });
    this.catIds = newsInfo?.catIds ?? []
    this.participants = newsInfo?.participants ?? []
    this.tags = newsInfo?.tags ?? []
  }

  doAction() {
    const title = (this.form.get('title')?.value ?? "")
    const description = (this.form.get('description')?.value ?? "")
    const enableComment = this.form.get('enableComment')?.value ?? false
    console.log(`do action title: ${title} - description: ${description} end`)
    console.log(`do action description: ${description}`)
    console.log(`do action enableComment: ${enableComment}`)
    console.log(`catIds: ${this.catIds}`)
    console.log(`participants: ${this.participants}`)
    console.log(`tags: ${this.tags}`)

    // this.isLoading = true
    if (this.currentMode == this.modes.CREATE) {
      this.newsService.callCreateNews(title, description, this.catIds, this.participants, this.tags, enableComment).then(response => {
        console.log(response)
        if (response) {
          this.nzMessageService.success("Create news success")
          this.setNewsInfo(response)
          this.currentMode = this.modes.UPDATE

        } else {
          this.nzMessageService.error("Create news failed")
        }
      }, (error) => {
        this.nzMessageService.error(error)
      })
    } else {
      this.newsService.callUpdateNewsInfo(this.newsId, title, description, this.catIds, this.participants, this.tags, enableComment).then(response => {
        if (response) {
          this.nzMessageService.success("Update news success")
          this.setNewsInfo(response)
        } else {
          this.nzMessageService.error("Update news failed")
        }
      }, (error) => {
        this.nzMessageService.error(error)
      })
    }
  }
}
