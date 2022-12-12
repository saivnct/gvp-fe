import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../../core/services/authentication.service";
import {SessionService} from "../../../../core/services/session.service";
import {Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {


  loginForm: FormGroup = this.fb.group({
    userName: [ '', [ Validators.required ] ],
    password: [ '', [ Validators.required ] ]
  });


  constructor(private fb: FormBuilder,
              private authenticationService: AuthenticationService,
              private sessionService: SessionService,
              private nzMessageService: NzMessageService,
              private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authenticationService.logout()
  }

  get f() { return this.loginForm.controls; }

  submitForm(): void {
    for (const i in this.loginForm.controls) {
      console.log(this.loginForm.controls[ i ].value)
      this.loginForm.controls[ i ].markAsDirty();
      this.loginForm.controls[ i ].updateValueAndValidity();
    }

    const userName = this.loginForm.controls['userName'].value ?? ""
    const password = this.loginForm.controls['password'].value ?? ""
    this.authenticationService.callLogin(userName, password).then(response => {
        console.log(`loginAdminUser success`)
        // console.log(response)
        this.nzMessageService.success(`Login username ${response.username} success`);
        this.router.navigate(['']);
      },
      err => {
        console.log(err)
        this.nzMessageService.error(err);
      });

  }

}
