import { FriendStateEnum } from "../enum/friend-state.enum";
import { ChaterType } from "../types/user/chater.type";

export interface Friends {
     _id: string;
     inviter : ChaterType;
     friend : ChaterType;
     state: FriendStateEnum;
     block: boolean;
     friend_at: Date;
}