
export const enum USER_GENDER {
  GENDER_NONE = 0,
  MALE = 1,
  FEMALE = 2,
}

export const enum USER_ROLE {
  GUEST = 0,
  NORMAL_USER = 1,
  CONTENT_USER = 2,
  KOL_USER = 3,
  MODERATOR = 99,
  ADMIN = 999,
  SUPER_ADMIN = 9999,
}


export const enum NEWS_STATUS {
  PENDING = 0,
  ACTIVED = 1,
  INACTIVED = 2,
}

export const enum MEDIA_STREAM_TYPE {
  UNKNOWN = 0,
  BUFFERING = 1,
  ON_DEMAND = 2,  // using on demand HLS/DASH media
}

export const enum MEDIA_TYPE {
  NONE_MEDIA_TYPE = 0,
  VIDEO = 1,
  AUDIO = 2,
  IMAGE = 3,
}

export const enum VIDEO_RESOLUTION {
  NONE_RESOLUTION = 0,
  SD_L = 1, //240p
  SD_M = 2, //360p
  SD = 3, //480p
  HD = 4, //720p
  FHD = 5,  //1080p
  FHD_H = 6,  //2K - 1080p
  QHD = 7, //1440p
  UHD = 8, //4K or 2160p
  FUHD = 9, //8K or 4320p
}

export const VIDEO_RESOLUTION_VALUE_MAP = new Map<number, string>([
  [VIDEO_RESOLUTION.NONE_RESOLUTION, '0'],
  [VIDEO_RESOLUTION.SD_L, '240'],
  [VIDEO_RESOLUTION.SD_M, '360'],
  [VIDEO_RESOLUTION.SD, '480'],
  [VIDEO_RESOLUTION.HD, '720'],
  [VIDEO_RESOLUTION.FHD, '1080'],
  [VIDEO_RESOLUTION.FHD_H, '1080'],
  [VIDEO_RESOLUTION.QHD, '1440'],
  [VIDEO_RESOLUTION.UHD, '2160'],
  [VIDEO_RESOLUTION.FUHD, '4320'],
]);

export const enum UPLOAD_TYPE {
  MEDIA_VIDEO_LOCAL = 1,
  MEDIA_VIDEO_URL= 2,
  PREVIEW_IMAGE_LOCAL = 3,
  PREVIEW_IMAGE_URL = 4,
}

export const enum ACCOUNT_STATUS {
  VERIFY = 1,
  VERIFIED
}
