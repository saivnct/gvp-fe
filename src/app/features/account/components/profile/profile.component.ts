import {Component, OnInit} from '@angular/core';
import {NzUploadFile} from "ng-zorro-antd/upload/interface";
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {UserInfo} from "../../../../shared/models/user-info.model";
import {USER_GENDER, USER_ROLE} from "../../../../shared/models/enum";
import {AuthenticationService} from "../../../../core/services/authentication.service";
import moment from "moment";
import {NewsService} from "../../../../core/services/news.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {UserAvatarInfo} from "../../../../shared/models/user-avatar-info.model";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  avatarUrl: string = "";

  form = this.fb.group({
    username: [ {value: '', disabled: true}, [ Validators.required ] ],
    email: [ {value: '', disabled: true}, [ Validators.required ] ],
    firstname: [ '', [ Validators.required ] ],
    lastname: [ '', [ Validators.required ] ],
    gender: [ '', [ Validators.required ] ],
    phoneNumber: [ '', [ Validators.required ] ],
    birthday: [ '', [ Validators.required ] ]
  });

  item: UserInfo = {
    username: "",
    email: "",
    role: USER_ROLE.GUEST,
    firstname: "",
    lastname: "",
    userAvatarInfo: undefined,
    gender: USER_GENDER.GENDER_NONE,
    phoneNumber: "",
    birthday: ""
  }

  avatarFile?: NzUploadFile;

  constructor(private fb: FormBuilder,
              private authenticationService: AuthenticationService,
              private nzMessageService: NzMessageService,
              private newsService: NewsService) { }

  ngOnInit(): void {
    this.fetchUserInfo()
  }

  fetchUserInfo() {
    this.authenticationService.callGetUserInfo().then(response => {
      if (response) {
        this.item = response
        console.log(response)

        if(response.userAvatarInfo) {
          this.setAvatar(response.userAvatarInfo)
        }

        this.form.patchValue({
          username: response.username,
          email: response.email,
          firstname: response.firstname,
          lastname: response.lastname,
          gender: response.gender.toString(),
          phoneNumber: response.phoneNumber,
          birthday: response.birthday
        });
      }
    })
  }

  setAvatar(avatarInfo: UserAvatarInfo) {
    const fileUrl = avatarInfo.fileUrl
    if (fileUrl) {
      this.avatarUrl = fileUrl
    } else {
      this.newsService.callGetFilePreSignedUrl(avatarInfo.fileId ?? "").then( response => {
        this.avatarUrl = response
      })
    }
  }

  blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString())
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  handleChange(info: NzUploadChangeParam): void {
    console.log("handleChange status")


  }

  beforeUpload = (file: NzUploadFile): boolean => {
    console.log(`beforeUpload ${file.name} - size ${file.size}`);
    this.avatarFile = file
    this.blobToBase64(file as unknown as File).then(data => {
      this.avatarUrl = data as string;
    })
    this.doUploadAvatar()
    return false
  };

  doUploadAvatar() {
    if(this.avatarFile) {
      const uploadFile = this.avatarFile as unknown as File
      console.log(`uploadFile ${uploadFile.size}`)
      this.newsService.callUploadUserAvatar(uploadFile).then(response => {
        this.nzMessageService.success("Upload success")
        if(response) {
          this.setAvatar(response)
        }
      }, error => {
        this.nzMessageService.error(error)
      })
    }
  }

  updateProfile() {
    const firstname = this.form.controls.firstname.value ?? ""
    const lastname = this.form.controls.lastname.value ?? ""
    const gender = Number(this.form.controls.gender.value ?? "0") as USER_GENDER
    const phoneNumber = this.form.controls.phoneNumber.value ?? ""
    console.log(`update username ${this.form.controls.username.value}`)
    console.log(`update email ${this.form.controls.email.value}`)
    console.log(`update firstname ${this.form.controls.firstname.value}`)
    console.log(`update lastname ${this.form.controls.lastname.value}`)
    console.log(`update gender ${this.form.controls.gender.value}`)
    console.log(`update phoneNumber ${this.form.controls.phoneNumber.value}`)
    const birthday = moment(this.form.controls.birthday.value).valueOf();
    this.authenticationService.callUpdateProfile(firstname, lastname, phoneNumber, gender, birthday).then(response => {
      this.nzMessageService.success("Update success")
      this.fetchUserInfo()
    }, error => {
      this.nzMessageService.error(error)
    })

  }

}
