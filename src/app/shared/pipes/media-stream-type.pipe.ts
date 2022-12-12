import { Pipe, PipeTransform } from '@angular/core';
import {MEDIA_STREAM_TYPE} from "../models/enum";

@Pipe({
  name: 'mediaStreamType'
})
export class MediaStreamTypePipe implements PipeTransform {

  transform(value: number): string {
    switch (value) {
      case MEDIA_STREAM_TYPE.BUFFERING: {
        return "Buffering"
      }
      case MEDIA_STREAM_TYPE.ON_DEMAND: {
        return "On Demand"
      }
      default: {
        return "Unknown"
      }
    }
  }

}
