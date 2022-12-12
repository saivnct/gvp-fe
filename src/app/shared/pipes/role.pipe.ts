import { Pipe, PipeTransform } from '@angular/core';
import {NEWS_STATUS, USER_ROLE} from "../models/enum";

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  transform(value: number): string {
    switch (value) {
      case USER_ROLE.GUEST: {
        return "GUEST"
      }
      case USER_ROLE.NORMAL_USER: {
        return "NORMAL"
      }
      case USER_ROLE.CONTENT_USER: {
        return "CONTENT"
      }
      case USER_ROLE.KOL_USER: {
        return "KOL"
      }
      case USER_ROLE.MODERATOR: {
        return "MODERATOR"
      }
      case USER_ROLE.ADMIN: {
        return "ADMIN"
      }
      case USER_ROLE.SUPER_ADMIN: {
        return "SUPER ADMIN"
      }
      default: {
        return "Unknown"
      }
    }
  }

}
