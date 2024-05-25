import { Socket } from 'socket.io-client';

export type SocketProps = {
     clientID: string;
     user: string;
     sessionID?: string;
}

export interface TshusSocket extends Socket {
  users: SocketProps[];
}
