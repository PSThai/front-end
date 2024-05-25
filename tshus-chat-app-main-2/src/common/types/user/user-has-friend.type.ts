import { FriendStateEnum } from '@/common/enum/friend-state.enum';
import { User } from '@/common/interface/User';

export interface UserHasFriend extends User {
  state: FriendStateEnum;
  isSender: boolean;
}
