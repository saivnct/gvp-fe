import { Injectable } from '@angular/core';
import {gvpServiceClient} from "./grpc/src/app/core/services/grpc/gvp-sv_pb_service";
import {environment} from "../../../environments/environment";
import {LoginRequest} from "./grpc/src/app/core/services/grpc/gvp-rq-res-account_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {GrpcResponseService} from "./grpc-response.service";
import {GetAllCategoryRequest} from "./grpc/src/app/core/services/grpc/gvp-rq-res-news-category_pb";
import {CategoryInfo} from "../../shared/models/category-info.model";
import {AuthenticationService} from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  client: gvpServiceClient  = new gvpServiceClient(environment.grpcUrl);

  jwt = ""

  constructor(private authenticationService: AuthenticationService) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser && currentUser.token) {
      this.jwt = currentUser.token
    }
  }

  async callGetAllCategories() {
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", this.jwt)

    return new Promise<CategoryInfo[]>((resolve, reject) => {

      const request = new GetAllCategoryRequest();
      this.client.getAllCategory(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          console.log("receive !!!!")
          console.error(error.code);
          console.error(error.message);
          if(error.code == 7) {
            this.authenticationService.logout(true);
          }
          return
        }

        const items = response?.getCategoryinfosList().map(res => {
          return GrpcResponseService.parseGrpcCategoryInfoItemResponse(res)
        });

        if (items) resolve(items);

      });
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
          return
        }

        const jwt = response?.getJwt()

        console.log(`login return jwt: ${jwt}`)

        resolve(jwt)
      });
    });
  }
}
