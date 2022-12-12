import {MEDIA_STREAM_TYPE, MEDIA_TYPE, VIDEO_RESOLUTION} from "./enum";

export interface MediaInfo {
  fileId: string;
  fileName: string;
  fileUrl: string;
  mediaType: MEDIA_TYPE;
  mediaStreamType: MEDIA_STREAM_TYPE
  resolution?: VIDEO_RESOLUTION;
  checksum: string;
}
