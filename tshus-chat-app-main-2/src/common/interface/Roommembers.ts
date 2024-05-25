import { RoommembersEnum } from "../enum/roommember-role.enum";

export interface Roommembers {
     _id: string;
     nickname: string;
     room: string;
     user: string;
     role: RoommembersEnum;
     block: boolean;
     created_at: Date;
     updated_at: Date;
}