import { Component, OnInit } from '@angular/core';
import {NewsService} from "../../../../core/services/news.service";
import {NewsInfo} from "../../../../shared/models/news-info.model";
import {ActivatedRoute, Router} from "@angular/router";
import {
  TOP_TIME_TYPE,
  TOP_TIME_TYPEMap,
  TOP_TYPE
} from "../../../../core/services/grpc/src/app/core/services/grpc/xvp-model_pb";
import {map} from "rxjs";
import {CategoryInfo} from "../../../../shared/models/category-info.model";
import {CategoryService} from "../../../../core/services/category.service";
import {MediaService} from "../../../../core/services/media.service";
// import SwiperCore, { Navigation } from "swiper";

declare var require: any

// install Swiper modules
// SwiperCore.use([Navigation]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  title = ''
  id = ''

  //grid
  items: NewsInfo[] = [];
  page = 0;
  pageSize = 12
  totalItem = 0;
  loading = false;

  itemsCat = new Map<string, NewsInfo[]>();

  modes = {
    HOME: 1,
    TAG: 2,
    CATEGORY: 3,
    SEARCH: 4,
    ACTOR: 5,
  }

  currentMode = this.modes.HOME

  //suggestion
  topViewType = 'week'
  suggestLimitItem = 5
  itemsSuggestion: NewsInfo[] = [];

  //tag
  tags: string[] = [];

  //category
  categories: CategoryInfo[] = [];
  selectedCategory?: CategoryInfo

  private mediaService = new MediaService('(max-width: 768px)');
  categoryListVisible = true

  constructor ( private newsService: NewsService,
                private categoryService: CategoryService,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state)).subscribe(res=>{
      console.log("check state")
      console.log(res)
      if(res.item) {
        this.selectedCategory = res.item
      }
    })

    this.activatedRoute.url.subscribe(urls => {
      console.log("active route")
      console.log(urls)
      if (urls.length > 1) {
        this.id = urls[1].path
        this.title = this.id
        if(urls[0].path == "tag") {
          this.currentMode = this.modes.TAG
          this.fetchData(undefined, undefined, [this.id], undefined)
        } else if(urls[0].path == "category") {
          this.currentMode = this.modes.CATEGORY
          this.fetchData([this.id], undefined, undefined, undefined)
        } else if(urls[0].path == "search") {
          this.currentMode = this.modes.SEARCH
          this.fetchData(undefined, undefined, undefined, this.id)
        } else if(urls[0].path == "actor") {
          this.currentMode = this.modes.ACTOR
          this.fetchData(undefined, [this.id], undefined, undefined)
        }
      } else {
        this.currentMode = this.modes.HOME
        // this.fetchData()
      }

    })

    this.mediaService.match$.subscribe(value => {
      console.log(`mediaService ${value}`)
      this.categoryListVisible = !value
    });

    this.fetchSuggestionData('week')

    this.fetchTagsData()

    this.fetchAllCategoryData()
  }

  fetchData(catIds?: string[], participants?: string[], tags?: string[], searchPhrase?: string) {
    console.log(`fetchData page ${this.page} - pageSize ${this.pageSize}`)

    this.loading = true
    this.newsService.callGetListNews(this.page, this.pageSize, catIds, participants, tags, searchPhrase).then(response => {
      console.log(`movieService callGetListNews`)
      console.log(`response total ${response.totalItem} - ${response.items}`)
      this.loading = false
      this.items = response.items

      // for (let i = 0; i < 10; i++) {
      //   this.items.push(response.items[0])
      // }
      this.page = response.page
      this.pageSize = response.pageSize
      this.totalItem = response.totalItem
    })
  }

  fetchNewsByCategory(catId: string) {
    console.log(`fetchNewsByCategory catId ${catId}`)

    this.newsService.callGetListNews(this.page, 6, [catId]).then(response => {
      console.log(response)
      if(response.items.length > 0) {
        this.itemsCat.set(catId, response.items)
      } else this.itemsCat.set(catId, [])

      console.log(`get cat info ${catId}`)
      console.log(this.itemsCat.get(catId))
    })
  }

  fetchSuggestionData(type: string) {
    let topTimeType: TOP_TIME_TYPEMap[keyof TOP_TIME_TYPEMap] = TOP_TIME_TYPE.WEEK
    if (type == 'week') {
      topTimeType = TOP_TIME_TYPE.WEEK
    } else if (type == 'month') {
      topTimeType = TOP_TIME_TYPE.MONTH
    }
    this.newsService.callGetListTopViewNews(this.suggestLimitItem, TOP_TYPE.VIEWS, topTimeType).then(response => {
      console.log(`fetchSuggestionData`)
      if (response.length > 0) {
        this.itemsSuggestion = response
      }
    })
  }

  onClick(item: NewsInfo) {
    this.router.navigate(['/watch', item.newsId]).then(r => console.log("navigate to watch id"));
  }

  onPageIndexChange(pageIndex: number) {
    console.log(`onPageIndexChange ${pageIndex}`)
    this.page = pageIndex - 1
    this.fetchData()
  }

  onPageSizeChange(pageSize: number) {
    console.log(`onPageSizeChange ${pageSize}`)
    this.pageSize = pageSize
    this.fetchData()
  }

  onClickSuggestItem(item: NewsInfo) {
    this.router.navigate(['/watch', item.newsId]).then(r => console.log("navigate to watch id"));
  }

  onChangeSuggestionType(type: string) {
    this.fetchSuggestionData(type)
  }

  //tags
  fetchTagsData() {
    this.newsService.callGetNewsTags(0, 20).then(response => {
      this.tags = response.items
    })
  }

  onClickTag(item: string) {
    this.router.navigate(['/tag', item]).then(r => console.log("navigate to tag"));
  }

  //category
  fetchAllCategoryData() {
    this.categoryService.callGetAllCategories().then(response => {
      console.log("callGetAllCategories")
      console.log(response)
      this.categories = response

      if(this.currentMode == this.modes.CATEGORY) {
        if(!this.selectedCategory) {
          let findIndex = this.categories.findIndex(item => {
            return item.catId == this.id
          })
          if(findIndex >= 0) {
            this.selectedCategory = this.categories[findIndex]
          }
        }
      } else if(this.currentMode == this.modes.HOME) {
        this.categories.forEach(catInfo => {
          this.fetchNewsByCategory(catInfo.catId)
        })
      }
    })
  }

  onClickCategory(item: CategoryInfo) {
    this.router.navigate(['/category', item.catId],
      { state: { item: item } }
    ).then(r => console.log("navigate to category"));
  }
}
