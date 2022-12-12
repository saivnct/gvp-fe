import {USER_GENDER, USER_ROLE} from "./enum";
import {UserAvatarInfo} from "./user-avatar-info.model";

export interface UserInfo {
  username: string;
  email: string;
  role: USER_ROLE;
  firstname: string;
  lastname: string;
  userAvatarInfo?: UserAvatarInfo;
  gender: USER_GENDER;
  phoneNumber: string;
  birthday: string;
}
