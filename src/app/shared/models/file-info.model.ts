import {MEDIA_TYPE, VIDEO_RESOLUTION} from "./enum";

export interface FileInfo {
  fileId: string;
  fileName: string;
  mediaType: MEDIA_TYPE;
  resolution?: VIDEO_RESOLUTION;
  checksum: string;
}
