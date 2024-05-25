import { Avatar, Badge, Flex, Typography, Popover, Skeleton } from 'antd';
import { FC, Fragment, memo, useEffect, useState } from 'react';
import AddFriendsModal from '@/client/components/modals/friend/add/private';
import Search from 'antd/es/input/Search';
import { useConfig } from '@/common/hooks/use-config';
import { debounce } from 'lodash';
import { fetcher } from '@/common/utils/fetcher';
import { Response } from '@/common/types/response/response.type';
import { ConversationEnum } from '@/common/enum/conversation.enum';
import { ThemeEnum } from '@/common/enum/theme.enum';
import CreateGroupModal from '@/client/components/modals/friend/add/group';
import EmptyHorizontal from '@/client/components/empty/horizontal.empty';
import { SocketProps, TshusSocket } from '@/common/types/other/socket.type';
import { useOnline } from '@/common/hooks/use-online';
import { isOnline } from '@/common/utils/ultils';
import { useSocket } from '@/common/hooks/use-socket';
import { FriendsActionsDto } from '@/common/types/friends/actions.type';
import { useAuth } from '@/client/hooks/use-auth';
import { User } from '@/common/interface/User';
import { AuthHookType } from '@/common/types/other/hook.type';
import { FriendsActionsEnum } from '@/common/enum/friends-actions.enum';
import { ConversationType } from '@/common/types/conversation/cvs.type';
import { Conversations } from '@/common/interface/Conversations';

// Text
const { Text } = Typography;

type Props = {
  cvsContext: ConversationType;
  token: any;
  user: AuthHookType<User>;
};

// Loading enum
enum LoadingSearch {
  ON = 'ON',
  OFF = 'OFF',
  STATIC = 'STATIC',
}

const ChatSide: FC<Props> = ({ cvsContext, token, user }: Props) => {
  // Config
  const config = useConfig();

  const delay = 300;

  // Onlines
  const onlines: SocketProps[] = useOnline();

  // Handle Set Conversation
  const handleSetCvs = (cvs: any) => {
    // Set Cvs
    cvsContext.current?.get?._id !== cvs?._id && cvsContext.current?.set(cvs);
  };

  // Search Cvs list
  const [searchCvs, setSearchCvs] = useState<Conversations[]>([]);

  // Socket
  const socket: TshusSocket = useSocket();

  // Auth
  const auth: AuthHookType<User> = useAuth();

  // Search loading state
  const [searchLoading, setSearchLoading] = useState<LoadingSearch>(
    LoadingSearch.STATIC,
  );

  const [csvLoading, setCsvLoading] = useState<boolean>(true);

  // Search pop
  const [searchPop, setSearchPop] = useState<boolean>(false);

  // On Search
  const onSearch = async (value: string) => {
    // Exception
    if (value && value.trim() !== '') {
      // Response
      const res: Response = await fetcher({
        method: 'GET',
        url: '/conversations/search',
        payload: {
          page: 1,
          search: value,
          user: user.get?._id,
        },
      });

      // Check status
      if (res?.status === 200) {
        // Set Cvs
        setSearchCvs(res?.data);
      }

      // Disable loading
      setSearchLoading(LoadingSearch.OFF);
    } else {
      // Disable loading
      setSearchLoading(LoadingSearch.STATIC);
    }
  };

  // Define the debounced version of onSearch
  const debouncedOnSearch = debounce(onSearch, 500);

  // Use Effect
  useEffect(() => {
    // Load Conversations
    (async () => {
      // Enable loading
      setCsvLoading(true);

      // Get conversations
      const res: any = await fetcher({
        method: 'GET',
        url: '/conversations/page',
        payload: { page: 1, user: user.get?._id },
      });

      // Check response and handle data
      if (res?.status === 200) cvsContext.list.set(res?.data);

      // Disable Loading
      setTimeout(() => {
        setCsvLoading(false);
      }, delay);
    })();

    // Return clean
    return () => cvsContext.list.set([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect load conversation with socket
  useEffect(() => {
    (async () => {
      // Check socket
      if (socket) {
        // Listen
        socket?.on('friend.actions:client', (result: FriendsActionsDto) => {
          // Check
          if (
            result.receiver.user === auth?.get?._id &&
            FriendsActionsEnum.ACCEPT === result.action
          ) {
            // Insert list covnversation
            cvsContext.list?.insert(result?.chats);
          }
        });
      }
    })();

    // Clean event
    return () => {
      socket?.off('friend.actions:client');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Return
  return (
    <Fragment>
      <div style={{ padding: 20 }}>
        <Flex vertical>
          <Flex justify="space-between" align="center">
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'medium',
                color: token.colorTextSecondary,
              }}
            >
              Trò chuyện
            </Text>
            <Flex gap={5}>
              <AddFriendsModal />
              <CreateGroupModal />
            </Flex>
          </Flex>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 'medium',
              color: token.colorTextPlaceholder,
            }}
          >
            Ứng dụng nhắn tin
          </Text>
        </Flex>
        <Popover
          placement="bottomLeft"
          title="Kết quả tìm kiếm"
          trigger={'click'}
          open={searchPop}
          onOpenChange={(val) => {
            // Check and set pop
            searchLoading !== LoadingSearch.STATIC && setSearchPop(val);
          }}
          content={
            searchLoading === LoadingSearch.OFF ? (
              searchCvs.length > 0 ? (
                searchCvs?.map((cvs) => {
                  // Is Rooms
                  const isRooms = cvs?.type === ConversationEnum.ROOMS;

                  const chats = cvs?.chats?.[0];

                  const isInviter = user.get?._id === chats?.inviter?.user;

                  const cvsName = isRooms
                    ? cvs?.rooms[0]?.name
                    : isInviter
                    ? chats?.friend?.nickname
                    : chats?.inviter?.nickname;

                  // Return
                  return (
                    <Flex
                      key={cvs._id}
                      justify="space-between"
                      style={{ cursor: 'pointer', padding: '1px 2px' }}
                      className={`${
                        config.get.theme === ThemeEnum.DARK
                          ? 'cvs-d-hover'
                          : 'cvs-l-hover'
                      } ${
                        cvsContext.current.get?._id === cvs._id &&
                        ` ${
                          config.get.theme === ThemeEnum.DARK
                            ? 'cvs-d-active'
                            : 'cvs-l-active'
                        }`
                      }`}
                      align="center"
                      onClick={() => handleSetCvs(cvs)}
                    >
                      <Flex align="center" gap={15}>
                        <Badge
                          dot
                          style={{
                            padding: 3.5,
                            background: token.colorSuccess,
                          }}
                          status="processing"
                          offset={[-1, '100%']}
                        >
                          <Avatar
                            shape="square"
                            alt={cvsName?.charAt(0)
                            }
                            size={35}
                          >
                            {cvsName?.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Flex gap={1} vertical justify="space-between">
                          <Text style={{ fontSize: 13 }}>{cvsName}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {cvs.last_message}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  );
                })
              ) : (
                <EmptyHorizontal desc="Không có dữ liệu" />
              )
            ) : (
              <Flex gap={10}>
                <Skeleton.Avatar active />
                <Skeleton.Input active />
              </Flex>
            )
          }
        >
          <Flex flex={1}>
            <Search
              variant="filled"
              placeholder="Tìm kiếm..."
              onSearch={onSearch}
              onChange={(e) => {
                // Value
                const value = e.target.value;

                // Change pop
                if (value === '' || !value) {
                  // Clear data
                  setSearchCvs([]);

                  // Set
                  setSearchPop(false);
                } else {
                  // Set
                  setSearchPop(true);
                }

                // Enable loading
                setSearchLoading(LoadingSearch.ON);

                // Debounce
                debouncedOnSearch(value);
              }}
              style={{ marginTop: 20 }}
            />
          </Flex>
        </Popover>
      </div>
      <Flex vertical>
        {!csvLoading ? (
          cvsContext?.list?.get && cvsContext.list.get.length > 0 ? (
            cvsContext?.list.get?.map((item: any, index: number) => {
              // Is Rooms
              const isRooms = item?.type === ConversationEnum.ROOMS;

              const chats = item?.chats?.[0];

              const data = isRooms
                ? item?.rooms[0]
                : user.get?._id === chats?.inviter?.user
                ? chats?.friend
                : chats?.inviter;

              // Check

              // Cvs name
              const cvsName = isRooms ? data?.name : data?.nickname;

              // Return
              return (
                <Flex
                  gap={15}
                  key={index}
                  align="center"
                  style={{ padding: '10px 20px', cursor: 'pointer' }}
                  onClick={() => handleSetCvs(item)}
                  className={`${
                    config.get.theme === ThemeEnum.DARK
                      ? 'cvs-d-hover'
                      : 'cvs-l-hover'
                  } ${
                    cvsContext.current.get?._id === item?._id &&
                    ` ${
                      config.get.theme === ThemeEnum.DARK
                        ? 'cvs-d-active'
                        : 'cvs-l-active'
                    }`
                  }`}
                >
                  {isOnline(onlines, isRooms, data) ? (
                    <Badge
                      dot
                      style={{
                        padding: 3.5,
                        background: token.colorSuccess,
                      }}
                      status="processing"
                      offset={[-1, '100%']}
                    >
                      <Avatar shape="square" size={35}>
                        {cvsName?.charAt(0)}
                      </Avatar>
                    </Badge>
                  ) : (
                    <Avatar shape="square" size={35}>
                      {cvsName?.charAt(0)}
                    </Avatar>
                  )}

                  <Flex gap={1} vertical justify="space-between">
                    <Text style={{ fontSize: 13 }}>{cvsName}</Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        maxWidth: '170px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item?.last_message || 'Không có tin nhắn nào'}
                    </Text>
                  </Flex>
                </Flex>
              );
            })
          ) : (
            <EmptyHorizontal desc="Không có dữ liệu" />
          )
        ) : (
          <Flex vertical gap={10}>
            <SkeletonRender />
          </Flex>
        )}
      </Flex>
    </Fragment>
  );
};

const SkeletonRender: FC = () => {
  // Return
  return (
    <Fragment>
      {Array.from({ length: 7 }).map((item, index) => (
        <Flex
          key={index}
          gap={15}
          align="center"
          style={{ padding: '7px 20px' }}
          flex={1}
        >
          <Skeleton.Avatar
            active
            size={35}
            shape="square"
            className="flex-align"
          />
          <Skeleton.Input
            active
            style={{ height: 35 }}
            className="flex-align flex-1"
          />
        </Flex>
      ))}
    </Fragment>
  );
};

export default memo(ChatSide);
