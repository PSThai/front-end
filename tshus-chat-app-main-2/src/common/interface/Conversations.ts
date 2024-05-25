import { Messages } from "./Messages";

export interface Conversations {
  _id: string;
  type: string;
  chats?: any;
  rooms?: any;
  pins: Messages[];
  last_send: Date;
  last_message: string;
  created_at: Date;
  updated_at: Date;
}
