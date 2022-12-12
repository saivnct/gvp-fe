import { Pipe, PipeTransform } from '@angular/core';
import moment from "moment";

@Pipe({
  name: 'dateFromTimestamp'
})
export class DateFromTimestampPipe implements PipeTransform {

  transform(timestamp: number, isUTC = false, format = "DD/MM/YYYY"): string {
    if (!timestamp || timestamp <= 0) return "Unknown"
    let date = new Date(timestamp)
    if (isUTC) {
      return moment.utc(date).format(format)
    } else {
      return moment(date).format(format)
    }
  }

}
