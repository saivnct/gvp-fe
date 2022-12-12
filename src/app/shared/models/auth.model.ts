import {UserInfo} from "./user-info.model";

export interface Auth {
  token: string;
  expiresIn: number;
  username: string;
  userInfo: UserInfo | null
}
