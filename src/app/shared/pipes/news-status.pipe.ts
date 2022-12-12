import { Pipe, PipeTransform } from '@angular/core';
import {NEWS_STATUS} from "../models/enum";

@Pipe({
  name: 'newsStatus'
})
export class NewsStatusPipe implements PipeTransform {

  transform(value: number): string {
    switch (value) {
      case NEWS_STATUS.ACTIVED: {
        return "Active"
      }
      case NEWS_STATUS.PENDING: {
        return "Pending"
      }
      case NEWS_STATUS.INACTIVED: {
        return "Inactive"
      }
      default: {
        return "Unknown"
      }
    }
  }

}
