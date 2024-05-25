export interface User {
  _id: string;
  username: string;
  password: string;
  email: string;
  roles: string[];
  nickname: string;
  phone: number;
  avatar: string;
  created_at: string;
  updated_at: string;
}
