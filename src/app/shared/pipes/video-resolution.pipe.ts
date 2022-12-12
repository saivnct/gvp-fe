import { Pipe, PipeTransform } from '@angular/core';
import {VIDEO_RESOLUTION} from "../models/enum";

@Pipe({
  name: 'videoResolution'
})
export class VideoResolutionPipe implements PipeTransform {

  transform(value: number): string {
    switch (value) {
      case VIDEO_RESOLUTION.NONE_RESOLUTION: {
        return "None"
      }
      case VIDEO_RESOLUTION.SD_L: {
        return "SD_L 240p"
      }
      case VIDEO_RESOLUTION.SD_M: {
        return "SD_M 360p"
      }
      case VIDEO_RESOLUTION.SD: {
        return "SD 480p"
      }
      case VIDEO_RESOLUTION.HD: {
        return "HD 720p"
      }
      case VIDEO_RESOLUTION.FHD: {
        return "FHD 1080p"
      }
      case VIDEO_RESOLUTION.FHD_H: {
        return "FHD_H 2K"
      }
      case VIDEO_RESOLUTION.QHD: {
        return "QHD 1440p"
      }
      case VIDEO_RESOLUTION.UHD: {
        return "UHD 4K"
      }
      case VIDEO_RESOLUTION.FUHD: {
        return "FUHD 8K"
      }
      default: {
        return "Unknown"
      }
    }
  }

}
