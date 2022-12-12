import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {RouterModule} from "@angular/router";
import { HomeComponent } from './features/home/components/home/home.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import {NzAvatarModule} from "ng-zorro-antd/avatar";
import {NzPaginationModule} from "ng-zorro-antd/pagination";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import { PrimaryLayoutComponent } from './core/components/primary-layout/primary-layout.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { MovieDetailComponent } from './features/home/components/movie-detail/movie-detail.component';
import { NewsComponent } from './features/admin/components/news/news.component';
import { Error404Component } from './shared/pages/error404/error404.component';
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzListModule} from "ng-zorro-antd/list";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import { MovieCardComponent } from './shared/components/movie-card/movie-card.component';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout.component';
import {NzTableModule} from "ng-zorro-antd/table";
import {NzDropDownModule} from "ng-zorro-antd/dropdown";
import {NzMessageModule} from "ng-zorro-antd/message";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {NzModalModule} from "ng-zorro-antd/modal";
import {NzUploadModule} from "ng-zorro-antd/upload";
import { UploadMediaComponent } from './features/admin/components/upload-media/upload-media.component';
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzTypographyModule} from "ng-zorro-antd/typography";
import {NzTagModule} from "ng-zorro-antd/tag";
import { MovieListCardComponent } from './shared/components/movie-list-card/movie-list-card.component';
import { EditNewsComponent } from './features/admin/components/edit-news/edit-news.component';
import {NzNoAnimationModule} from "ng-zorro-antd/core/no-animation";
import {RemoveWhiteSpacePipe} from "./shared/pipes/remove-white-space.pipe";
import {NzSpinModule} from "ng-zorro-antd/spin";
import { PreviewImageInfoComponent } from './features/admin/components/preview-image-info/preview-image-info.component';
import { MediaInfoComponent } from './features/admin/components/media-info/media-info.component';
import { NewsStatusPipe } from './shared/pipes/news-status.pipe';
import { MediaTypePipe } from './shared/pipes/media-type.pipe';
import { MediaStreamTypePipe } from './shared/pipes/media-stream-type.pipe';
import { VideoResolutionPipe } from './shared/pipes/video-resolution.pipe';
import { DateFromTimestampPipe } from './shared/pipes/date-from-timestamp.pipe';
import {ProfileComponent} from "./features/account/components/profile/profile.component";
import {RegisterComponent} from "./features/account/components/register/register.component";
import {LoginComponent} from "./features/account/components/login/login.component";
import {NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {RolePipe} from "./shared/pipes/role.pipe";
import {NzRadioModule} from "ng-zorro-antd/radio";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzRateModule} from "ng-zorro-antd/rate";
// import {SwiperModule} from "swiper/angular";

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    PrimaryLayoutComponent,
    FooterComponent,
    MovieDetailComponent,
    LoginComponent,
    NewsComponent,
    Error404Component,
    MovieCardComponent,
    AdminLayoutComponent,
    UploadMediaComponent,
    MovieListCardComponent,
    EditNewsComponent,

    RemoveWhiteSpacePipe,
    PreviewImageInfoComponent,
    MediaInfoComponent,
    NewsStatusPipe,
    MediaTypePipe,
    MediaStreamTypePipe,
    VideoResolutionPipe,
    DateFromTimestampPipe,
    RolePipe,
    ProfileComponent,
    RegisterComponent,
],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        RouterModule,
        AppRoutingModule,
        NzAvatarModule,
        NzPaginationModule,
        NzCardModule,
        NzSkeletonModule,
        NzMenuModule,
        NzIconModule,
        NzListModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzTableModule,
        NzDropDownModule,
        NzMessageModule,
        NzToolTipModule,
        NzModalModule,
        NzUploadModule,
        NzSelectModule,
        NzCheckboxModule,
        NzDrawerModule,
        NzTypographyModule,
        NzTagModule,
        NzNoAnimationModule,
        NzSpinModule,
        NzDatePickerModule,
        NzRadioModule,
        NzEmptyModule,
        NzLayoutModule,
        NzRateModule,
        // SwiperModule
    ],
  providers: [
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
