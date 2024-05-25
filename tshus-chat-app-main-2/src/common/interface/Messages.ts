import { MesssageState } from "../enum/message-state.enum";
import { MessageType } from "../enum/message-type";
import { ChaterType } from "../types/user/chater.type";

export interface Messages {
     _id?: string;
     conversation: string | undefined;
     type: MessageType;
     files: any[];
     messages: string;
     reply?: any;
     state: MesssageState;
     sender: ChaterType;
     send_at: Date | string;
     last_message?: string;
     created_at?: Date | string;
     updated_at?: Date | string;
}
