import { Pipe, PipeTransform } from '@angular/core';
import {MEDIA_TYPE} from "../models/enum";

@Pipe({
  name: 'mediaType'
})
export class MediaTypePipe implements PipeTransform {

  transform(value: number): string {
    switch (value) {
      case MEDIA_TYPE.NONE_MEDIA_TYPE: {
        return "None"
      }
      case MEDIA_TYPE.VIDEO: {
        return "Video"
      }
      case MEDIA_TYPE.IMAGE: {
        return "Image"
      }
      case MEDIA_TYPE.AUDIO: {
        return "Audio"
      }
      default: {
        return "Unknown"
      }
    }
  }

}
