import { Conversations } from '@/common/interface/Conversations';

export interface CurrentConversationType {
  set: Function;
  get: Conversations | null | undefined;
  update: Function;
}

export interface ListConversationType {
  set: Function;
  get: Conversations[] | [] | undefined;
  update: Function;
  insert: Function;
}

export interface ConversationType {
  list: ListConversationType;
  current: CurrentConversationType;
}
