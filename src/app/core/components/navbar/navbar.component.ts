import { Component, OnInit } from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {CategoryInfo} from "../../../shared/models/category-info.model";
import {AuthenticationService} from "../../services/authentication.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {Auth} from "../../../shared/models/auth.model";
import {Router} from "@angular/router";
import {NzMenuModeType} from "ng-zorro-antd/menu/menu.types";
import {MediaService} from "../../services/media.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  menuMode: NzMenuModeType = 'horizontal'

  menuItem = 'browse'

  items: CategoryInfo[] = [];

  quickViewVisible = false
  mobileMenuVisible = false
  mobileViewVisible = false

  auth: Auth = {
    token: '',
    expiresIn: 0,
    username: '',
    userInfo: null
  }
  role = 0

  search = ''

  private mediaService = new MediaService('(max-width: 768px)');

  constructor(private categoryService: CategoryService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private modal: NzModalService) { }

  ngOnInit(): void {
    this.mediaService.match$.subscribe(value => {
      console.log(`mediaService ${value}`)
      this.mobileMenuVisible = value
      if(!value) {
        this.mobileViewVisible = false
      }
    });

    this.categoryService.callGetAllCategories().then(response => {
      console.log("callGetAllCategories")
      console.log(response)
      this.items = response
    })
    // this.authenticationService.callLogin("content", "123465aA@").then()
    this.authenticationService.currentUser.subscribe(auth => {
      if(auth) {
        this.auth = auth
        this.role = this.auth.userInfo?.role ?? 0
      }
    })

    console.log(this.auth)
  }

  quickViewToggle() {
    this.quickViewVisible = !this.quickViewVisible;
  }

  onClickCategory(item: CategoryInfo) {
    this.quickViewVisible = false
    this.router.navigate(['/category', item.catId],
      { state: { item: item } }
    ).then(r => console.log("navigate to category"));
  }

  onKeyDownSearch(event: Event) {
    if(this.search) {
      this.router.navigate(['/search', this.search]).then(r => {
        this.search = ''
      })
    }
  }

  doLogout() {
    console.log("doLogout")
    this.modal.confirm({
      nzTitle: 'Do you want to logout?',
      nzContent: '',
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          this.authenticationService.logout(false);
          setTimeout(resolve, 0);
        }).catch(() => console.log('Oops errors!'))
    });

  }

  toggleMobileMenu() {
    // this.menuMode = 'vertical'
    this.mobileViewVisible = !this.mobileViewVisible;
  }

  onClickMenu(menu: string) {
    this.mobileViewVisible = false

    this.menuItem = menu

    if(menu=='logout') {
      this.doLogout()
    }
  }
}
