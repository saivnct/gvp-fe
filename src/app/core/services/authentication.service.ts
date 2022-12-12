import { Injectable } from '@angular/core';
import {gvpServiceClient} from "./grpc/src/app/core/services/grpc/gvp-sv_pb_service";
import {environment} from "../../../environments/environment";
import {
  CreatAccountRequest,
  GetUserInfoRequest,
  LoginRequest,
  UpdateProfileRequest, VerifyAuthencodeRequest
} from "./grpc/src/app/core/services/grpc/gvp-rq-res-account_pb";
import {SessionService} from "./session.service";
import {BehaviorSubject, Observable} from "rxjs";
import {Auth} from "../../shared/models/auth.model";
import {USER_GENDERMap} from "./grpc/src/app/core/services/grpc/gvp-model_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {GrpcResponseService} from "./grpc-response.service";
import {UserInfo} from "../../shared/models/user-info.model";
import {Account} from "../../shared/models/account.model";
import {ACCOUNT_STATUS} from "../../shared/models/enum";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  client: gvpServiceClient  = new gvpServiceClient(environment.grpcUrl);

  chunkSize = 1024

  private currentUserSubject: BehaviorSubject<Auth>;
  public currentUser: Observable<Auth>;

  constructor(private sessionService: SessionService,
              private router: Router,) {
    const session = this.sessionService.getItem("session");
    this.currentUserSubject = new BehaviorSubject<Auth>(session);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Auth {
    return this.currentUserSubject.value;
  }

  callLogin(username: string, password: string) {
    return new Promise<Auth>((resolve, reject) => {

      const request = new LoginRequest();
      request.setUsername(username)
      request.setPassword(password)

      this.client.login(request, async (error, response) => {
        if (error) {
          console.error(error);
          reject(error.message)
        }

        const jwt = response?.getJwt() ?? ""

        const userInfo = await this.callGetUserInfo(jwt, username)
        const auth: Auth = {
          token: jwt,
          expiresIn: 0,
          username: username,
          userInfo: userInfo
        }
        this.sessionService.setItem("session", auth)

        console.log(`set item success`)
        const session = this.sessionService.getItem("session");
        console.log(session)
        this.currentUserSubject.next(auth);

        resolve(auth)
      });
    });
  }

  async callUpdateProfile(firstName?: string, lastName?: string, phoneNumber?: string, gender?: USER_GENDERMap[keyof USER_GENDERMap], birthday?: number) {
    const jwt = this.currentUserValue.token
    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", jwt)

    return new Promise<UserInfo | null>((resolve, reject) => {

      const request = new UpdateProfileRequest()
      if (firstName) {
        request.setFirstname(firstName)
      }
      if (lastName) {
        request.setLastname(lastName)
      }
      if (phoneNumber) {
        request.setPhonenumber(phoneNumber)
      }
      if (gender || gender == 0) {
        request.setGender(gender)
      }
      if (birthday) {
        request.setBirthday(birthday)
      }

      this.client.updateProfile(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const item = response?.getUserinfo()
        if (item){
          resolve(GrpcResponseService.parseGrpcUserInfoItemResponse(item))
        } else {
          resolve(null)
        }

      });
    });

  }

  async callGetUserInfo(withJwt = "", withUsername = "") {
    let jwt = withJwt
    if (!withJwt) {
      jwt = this.currentUserValue.token
    }

    let username = withUsername
    if (!withUsername) {
      username = this.currentUserValue.username
    }

    let metadata: grpc.Metadata = new grpc.Metadata
    metadata.set("Authorization", jwt)

    return new Promise<UserInfo | null>((resolve, reject) => {

      const request = new GetUserInfoRequest()
      request.setUsername(username)

      this.client.getUserInfo(request, metadata, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const item = response?.getUserinfo()
        if (item){
          resolve(GrpcResponseService.parseGrpcUserInfoItemResponse(item))
        } else {
          resolve(null)
        }

      });
    });

  }

  callCreatUser(username: string, email: string, password: string) {
    return new Promise<Account>((resolve, reject) => {

      const request = new CreatAccountRequest();
      request.setUsername(username)
      request.setEmail(email)
      request.setPassword(password)

      this.client.creatUser(request, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const account: Account = {
          username: response?.getUsername() ?? "",
          email: response?.getEmail() ?? "",
          code: response?.getAuthencodetimeout() ?? 0,
          status: ACCOUNT_STATUS.VERIFY
        }

        resolve(account)
      });
    });
  }

  callVerifyAuthenCode(account: Account) {
    return new Promise<Account>((resolve, reject) => {

      const request = new VerifyAuthencodeRequest();
      request.setUsername(account.username)
      request.setEmail(account.email)
      request.setAuthencode(account.code.toString())

      this.client.verifyAuthencode(request, (error, response) => {
        if (error){
          console.error(error);
          reject(error.message)
        }

        const account: Account = {
          username: response?.getUsername() ?? "",
          email: response?.getEmail() ?? "",
          code: 0,
          status: ACCOUNT_STATUS.VERIFIED
        }

        resolve(account)

      });
    });
  }

  logout(isNavigate = true) {
    console.log("do logout acc")
    this.sessionService.removeItem("session");
    const auth: Auth = {
      token: '',
      expiresIn: 0,
      username: '',
      userInfo: null
    }
    this.currentUserSubject.next(auth);

    if(isNavigate) {
      this.router.navigateByUrl('/login');
    }
  }

}
