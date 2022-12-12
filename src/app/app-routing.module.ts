import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./features/home/components/home/home.component";
import {PrimaryLayoutComponent} from "./core/components/primary-layout/primary-layout.component";
import {Error404Component} from "./shared/pages/error404/error404.component";
import {MovieDetailComponent} from "./features/home/components/movie-detail/movie-detail.component";
import {AdminLayoutComponent} from "./core/components/admin-layout/admin-layout.component";
import {NewsComponent} from "./features/admin/components/news/news.component";
import {UploadMediaComponent} from "./features/admin/components/upload-media/upload-media.component";
import {EditNewsComponent} from "./features/admin/components/edit-news/edit-news.component";
import {PreviewImageInfoComponent} from "./features/admin/components/preview-image-info/preview-image-info.component";
import {MediaInfoComponent} from "./features/admin/components/media-info/media-info.component";
import {LoginComponent} from "./features/account/components/login/login.component";
import {RegisterComponent} from "./features/account/components/register/register.component";
import {ProfileComponent} from "./features/account/components/profile/profile.component";
import {RoleGuard} from "./core/services/role-guard.service";

const routes: Routes = [
  { path: '', component: PrimaryLayoutComponent, children: [
      { path: '', component: HomeComponent },
      { path: 'tag/:id', component: HomeComponent },
      { path: 'category/:id', component: HomeComponent },
      { path: 'search/:id', component: HomeComponent },
      { path: 'actor/:id', component: HomeComponent },
      { path: 'watch/:id', component: MovieDetailComponent },
      { path: 'profile', component: ProfileComponent },
    ] },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [RoleGuard], children: [
      { path: 'news', component: NewsComponent },
      { path: 'news/upload/:id', component: UploadMediaComponent },
      { path: 'news/edit/:id', component: EditNewsComponent },
      { path: 'news/:id/preview-image-info', component: PreviewImageInfoComponent },
      { path: 'news/:id/media-info', component: MediaInfoComponent },
    ] },
  { path: '**', component: Error404Component },
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
