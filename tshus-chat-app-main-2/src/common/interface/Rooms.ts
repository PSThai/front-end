import { Roommembers } from "./Roommembers";

export interface Rooms {
  conversation: string;
  name: string;
  image: string;
  members_count: number;
  roommembers: Roommembers[];
  created_at: Date;
  updated_at: Date;
}
