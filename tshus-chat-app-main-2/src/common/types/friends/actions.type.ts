import { Conversations } from "@/common/interface/Conversations";
import { ChaterType } from "../user/chater.type";

export type FriendsActionsDto = {
  action: string;
  id: string;
  sender: ChaterType;
  receiver: ChaterType;
  chats?: Conversations
}
