import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../../core/services/authentication.service";
import {Account} from "../../../../shared/models/account.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  isModalVisible = false
  isOkLoading = false

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.signUpForm.controls['checkPassword'].updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.signUpForm.controls['password'].value) {
      return { confirm: true, error: true };
    } else {
      return {  };
    }
  }

  signUpForm: FormGroup = this.fb.group({
    userName         : [ null, [ Validators.required ] ],
    email            : [ null, [ Validators.required ] ],
    password         : [ null, [ Validators.required ] ],
    checkPassword    : [ null, [ Validators.required, this.confirmationValidator ] ],
    agree            : [ false ]
  });

  authenCode = ""

  account?: Account

  constructor(private fb: FormBuilder,
              private authenticationService: AuthenticationService,
              private nzMessageService: NzMessageService,
              private router: Router) {
  }

  ngOnInit(): void {

  }

  submitForm(): void {
    for (const i in this.signUpForm.controls) {
      this.signUpForm.controls[ i ].markAsDirty();
      this.signUpForm.controls[ i ].updateValueAndValidity();
    }

    const userName = this.signUpForm.controls['userName'].value ?? ""
    const email = this.signUpForm.controls['email'].value ?? ""
    const password = this.signUpForm.controls['password'].value ?? ""

    this.authenticationService.callCreatUser(userName, email, password).then(response => {
      this.nzMessageService.success("Request success. Waiting authen code")
      this.account = response
      this.showModal()
    }, err => {
      console.log(err)
      this.isOkLoading = false;
      this.nzMessageService.error(err);
    })
  }

  showModal(): void {
    this.isModalVisible = true;
  }

  handleModalOk(): void {
    this.isModalVisible = false;
    if(this.account) {
      this.account.code = Number(this.authenCode)
      this.isOkLoading = true;
      this.authenticationService.callVerifyAuthenCode(this.account).then(response => {
        this.nzMessageService.success("Create account success")
        this.isOkLoading = false;
        this.router.navigate(['/login']);
      }, err => {
          console.log(err)
        this.isOkLoading = false;
          this.nzMessageService.error(err);
        })
    }
  }

  handleModalCancel(): void {
    this.isModalVisible = false;
  }


}
