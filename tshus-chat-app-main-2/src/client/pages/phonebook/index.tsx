import { ChaterType } from '@/common/types/user/chater.type';
import { BASE_URL, fetcher } from '@/common/utils/fetcher';
import {
  App,
  Avatar,
  Button,
  Col,
  Divider,
  Flex,
  Row,
  Tag,
  theme,
  Typography,
} from 'antd';
import { Fragment, useEffect, useState } from 'react';
import Search from 'antd/es/input/Search';
import { formatToDateTime } from '@/common/utils/date';
import { Response } from '@/common/types/response/response.type';
import { useAuth } from '@/client/hooks/use-auth';
import EmptyHorizontal from '@/client/components/empty/horizontal.empty';
import { useSocket } from '@/common/hooks/use-socket';
import { Friends } from '@/common/interface/Friends';
import { FriendsActionsDto } from '@/common/types/friends/actions.type';
import { FriendsActionsEnum } from '@/common/enum/friends-actions.enum';
import { DotsThree } from '@phosphor-icons/react';
import { TshusSocket } from '@/common/types/other/socket.type';

// Use Token
const { useToken } = theme;

// Text
const { Text } = Typography;

export default function Phonebook() {
  // Auth
  const auth = useAuth();

  // App message
  const { message } = App.useApp();

  // Socket
  const socket: TshusSocket = useSocket();

  // List friends state
  const [friendsList, setFriendsList] = useState<any>(null);

  // Sender state
  const [friendSender, setFriendSender] = useState<any[]>([]);

  // Request state
  const [friendRequest, setFriendRequest] = useState<any[]>([]);

  // Effect
  useEffect(() => {
    // Load friends
    (async () => {
      // Response
      const res: Response = await fetcher({
        method: 'GET',
        url: '/friends/page',
        payload: { user: auth?.get?._id },
      });

      if (res?.status === 200) {
        // Set data
        setFriendsList(res?.data);
      }
      // Return
    })();

    // Load request
    (async () => {
      // Response
      const res: Response = await fetcher({
        method: 'GET',
        url: '/friends/load_request',
        payload: { user: auth?.get?._id },
      });

      // Check status
      if (res?.status === 200) {
        // Set request
        setFriendRequest(res?.data?.request);

        // Set sended
        setFriendSender(res?.data?.sended);
      }
      // Return
    })();
  }, [auth?.get?._id]);

  // Token
  const { token } = useToken();

  // Insert friend
  const insertFriend = (act: ChaterType) => {
    // First char of nickname
    const char: string = act.nickname.charAt(0).toUpperCase();

    // Set friend list
    setFriendsList({
      ...(friendsList || {}),
      [char]: [...(friendsList?.[char] || []), act],
    });
  };

  // Handle remove request friend
  const removeRequest = (id: string) => {
    // Temp friends sender
    const temp = friendRequest
      .map((i) => (i.id !== id ? null : i))
      .filter(Boolean);

    // Set new
    setFriendRequest(temp);
  };

  // Handle remove request friend
  const removeSender = (id: string) => {
    // Temp friends sender
    const temp = friendSender
      .map((i) => (i.id !== id ? null : i))
      .filter(Boolean);

    // Set new
    setFriendSender(temp);
  };

  // Accept request
  const acceptRequest = async (id: string, request: ChaterType) => {
    // Expeption
    try {
      // Send
      socket?.emit('friend.actions:server', {
        id,
        action: FriendsActionsEnum.ACCEPT,
        receiver: request,
        sender: auth?.get,
      });

      // Remove request
      removeRequest(id);

      // Insert friend
      insertFriend(request);
    } catch (error) {
      // error message
      message.error('Đồng ý lời mời kết bạn thất bại');
    }
  };

  // Cancel request
  const cancelRequest = async (id: string, request: ChaterType) => {
    // Expeption
    try {
      // Send
      socket?.emit('friend.actions:server', {
        id,
        action: FriendsActionsEnum.CANCEL,
        receiver: request,
        sender: auth?.get,
      });

      // Remove request
      removeRequest(id);
    } catch (error) {
      // error message
      message.error('Từ chối lời mời kết bạn thất bại');
    }
  };

  // Cancel request
  const cancelSended = async (id: string, sender: ChaterType) => {
    // Expeption
    try {
      // Send
      socket?.emit('friend.actions:server', {
        id,
        action: FriendsActionsEnum.RECOVER,
        receiver: sender,
        sender: auth?.get,
      });

      // Remove sender
      removeSender(id);
    } catch (error) {
      // error message
      message.error('Thu hồi lời mời kết bạn thất bại');
    }
  };

  // First Loading Use Effect
  useEffect(() => {
    // Check socket connected
    if (socket) {
      // Subscribes events friend:client
      socket?.on('friend:client', async (result: Friends) => {
        // Check request from
        if (result?.friend?.user === auth?.get?._id) {
          // Set request
          setFriendRequest((prev: any) => [...prev, result]);
        } else if (result?.inviter?.user === auth?.get?._id) {
          // Set sender
          setFriendSender((prev: any) => [...prev, result]);
        }
      });

      // Subscribes events friend.actions:client
      socket?.on('friend.actions:client', async (result: FriendsActionsDto) => {
        // Check sender request from
        if (result.receiver.user === auth?.get?._id) {
          // Check action
          switch (result.action) {
            case FriendsActionsEnum.ACCEPT:
              // Remove sender
              removeSender(result.id);

              // Insert friend
              insertFriend(result.sender);

              // Success message
              message.success('Đồng ý lời mời kết bạn thành công');
              break;
            case FriendsActionsEnum.CANCEL:
              // Remove sender
              removeSender(result.id);

              // Success message
              message.success('Từ chối lời mời kết bạn thành công');
              break;
            case FriendsActionsEnum.RECOVER:
              // Remove request
              removeRequest(result.id);

              // Success message
              message.success('Thu hồi lời mời kết bạn thành công');
              break;
          }
        }
      });
    }

    // Cleanup
    return () => {
      socket?.off('friend:client');
      socket?.off('friend.actions:client');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return
  return (
    <Fragment>
      <Row style={{ height: '100%' }}>
        <Col
          xl={5}
          lg={6}
          md={8}
          sm={24}
          xs={24}
          style={{ borderRight: `1px solid ${token.colorBorder}` }}
        >
          <Flex style={{ padding: 20 }} vertical>
            <Flex vertical>
              <Flex justify="space-between" align="center">
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'medium',
                    color: token.colorTextSecondary,
                  }}
                >
                  Danh sách bạn bè
                </Text>
              </Flex>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 'medium',
                  color: token.colorTextPlaceholder,
                }}
              >
                Danh sách tất cả các bạn bè.
              </Text>
            </Flex>
            <Flex flex={1}>
              <Search
                variant="filled"
                placeholder="Tìm kiếm bạn bè..."
                style={{ marginTop: 20 }}
              />
            </Flex>
            <Flex vertical gap={10}>
              {friendsList &&
                Object.keys(friendsList)?.map((key: string) => (
                  <Flex vertical key={key}>
                    <Divider orientation="left" plain orientationMargin="0">
                      <Text
                        style={{
                          color: token.colorPrimary,
                        }}
                      >
                        {key}
                      </Text>
                    </Divider>
                    {friendsList?.[key as keyof typeof friendsList]?.map(
                      ({ nickname, avatar, user }: ChaterType) => (
                        <Flex justify="space-between" key={user}>
                          <Flex align="center" gap={10}>
                            <Avatar
                              shape="square"
                              size={27}
                              src={`${BASE_URL}/${avatar}`}
                            >
                              {nickname?.charAt(0)}
                            </Avatar>
                            <Text style={{ fontSize: 14, fontWeight: '400' }}>
                              {nickname}
                            </Text>
                          </Flex>
                          <Button
                            style={{ height: 'unset', padding: '1px' }}
                            type="text"
                          >
                            <Flex align="center">
                              <DotsThree size={20} />
                            </Flex>
                          </Button>
                        </Flex>
                      ),
                    )}
                  </Flex>
                ))}
            </Flex>
          </Flex>
        </Col>
        <Col xl={19} lg={18} md={16} sm={0} xs={0} className="h-100">
          <Flex style={{ padding: 20 }} vertical>
            <Flex vertical>
              <Flex justify="space-between" align="center">
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'medium',
                    color: token.colorTextSecondary,
                  }}
                >
                  Lời mời kết bạn
                </Text>
              </Flex>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 'medium',
                  color: token.colorTextPlaceholder,
                }}
              >
                Danh sách tất cả các lời mời kết bạn.
              </Text>
            </Flex>
            <Flex flex={1}>
              <Search
                variant="filled"
                placeholder="Tìm kiếm lời mời kết bạn..."
                style={{ marginTop: 20 }}
              />
            </Flex>
            <Flex vertical gap={20} style={{ padding: '15px 5px' }}>
              <Flex>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'medium',
                    color: token.colorTextSecondary,
                  }}
                >
                  Lời mời kết bạn đã nhận{'  '}
                  <Tag style={{ marginLeft: 5 }} color={token.colorPrimary}>
                    {friendRequest?.length ?? 0}
                  </Tag>
                </Text>
              </Flex>
              <Row gutter={[20, 20]}>
                {friendRequest?.length > 0 ? (
                  friendRequest?.map((request: any) => (
                    <Col span={6} key={request?.inviter?.user}>
                      <Flex
                        vertical
                        gap={10}
                        style={{
                          border: `1px solid ${token.colorBorder}`,
                          borderRadius: 5,
                          padding: 15,
                        }}
                      >
                        <Flex vertical gap={10}>
                          <Flex gap={10} align="center">
                            <Avatar
                              shape="square"
                              size={37}
                              src={`${BASE_URL}/${request?.inviter?.avatar}`}
                            >
                              {request?.inviter?.nickname?.charAt(0)}
                            </Avatar>
                            <Flex vertical gap={1}>
                              <Text style={{ fontSize: 14, fontWeight: '400' }}>
                                {request?.inviter?.nickname}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '400',
                                  color: token.colorTextDescription,
                                }}
                              >
                                {formatToDateTime(
                                  request?.friend_at?.toString(),
                                )}
                              </Text>
                            </Flex>
                          </Flex>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '400',
                              color: '#F29339',
                            }}
                          >
                            {request?.inviter?.nickname} đang chờ bạn phản hồi
                          </Text>
                        </Flex>
                        <Flex gap={15} justify="space-between">
                          <Button
                            style={{ width: '100%' }}
                            type="primary"
                            onClick={() =>
                              acceptRequest(request?._id, request?.inviter)
                            }
                          >
                            Đồng ý
                          </Button>
                          <Button
                            style={{ width: '100%' }}
                            danger
                            onClick={() =>
                              cancelRequest(request?._id, request?.inviter)
                            }
                          >
                            Từ chối
                          </Button>
                        </Flex>
                      </Flex>
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <EmptyHorizontal desc="Không có lời mời kết bạn nào!" />
                  </Col>
                )}
              </Row>
            </Flex>
            <Flex vertical gap={20} style={{ padding: '15px 5px' }}>
              <Flex>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'medium',
                    color: token.colorTextSecondary,
                  }}
                >
                  Lời mời kết bạn đã gửi, đang chờ xác nhận{'  '}
                  <Tag style={{ marginLeft: 5 }} color={token.colorPrimary}>
                    {friendSender?.length ?? 0}
                  </Tag>
                </Text>
              </Flex>
              <Row gutter={[20, 20]}>
                {friendSender?.length > 0 ? (
                  friendSender?.map((sender) => (
                    <Col span={6} key={sender?.friend?.user}>
                      <Flex
                        vertical
                        gap={10}
                        style={{
                          border: `1px solid ${token.colorBorder}`,
                          borderRadius: 5,
                          padding: 15,
                        }}
                      >
                        <Flex vertical gap={10}>
                          <Flex gap={10} align="center">
                            <Avatar
                              shape="square"
                              size={37}
                              src={`${BASE_URL}/${sender?.friend?.avatar}`}
                            >
                              {sender?.friend?.nickname?.charAt(0)}
                            </Avatar>
                            <Flex vertical gap={1}>
                              <Text style={{ fontSize: 14, fontWeight: '400' }}>
                                {sender?.friend?.nickname}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '400',
                                  color: token.colorTextDescription,
                                }}
                              >
                                {formatToDateTime(
                                  sender?.friend_at?.toString(),
                                )}
                              </Text>
                            </Flex>
                          </Flex>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '400',
                              color: '#F29339',
                            }}
                          >
                            Đang chờ {sender?.friend?.nickname} phản hồi
                          </Text>
                        </Flex>
                        <Button
                          onClick={() =>
                            cancelSended(sender?._id, sender?.friend)
                          }
                        >
                          Thu hồi lời mời
                        </Button>
                      </Flex>
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <EmptyHorizontal desc="Chưa gửi lời mời kết bạn nào!" />
                  </Col>
                )}
              </Row>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </Fragment>
  );
}
