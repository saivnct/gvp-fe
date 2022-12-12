import {MEDIA_TYPE} from "./enum";

export interface PreviewImageInfo {
  fileId: string;
  fileName: string;
  fileUrl: string;
  mainPreview: boolean;
  checksum: string;
  mediaType: MEDIA_TYPE;
}
