import { App, Avatar, Button, Flex, Modal, Tooltip, Typography } from 'antd';
import { Hourglass, UserPlus, Users } from '@phosphor-icons/react';
import React, { FC, Fragment, memo, MouseEventHandler, useEffect, useState } from 'react';
import { fetcher } from '@/common/utils/fetcher';
import { useAuth } from '@/client/hooks/use-auth';
import { FriendStateEnum } from '@/common/enum/friend-state.enum';
import { green, blue } from '@ant-design/colors';
import { BASE_URL } from '@/common/utils/fetcher';
import { User } from '@/common/interface/User';
import { Response } from '@/common/types/response/response.type';
import { useConfig } from '@/common/hooks/use-config';
import { AuthHookType } from '@/common/types/other/hook.type';
import { UserHasFriend } from '@/common/types/user/user-has-friend.type';
import { useSocket } from '@/common/hooks/use-socket';
import { TshusSocket } from '@/common/types/other/socket.type';

const { Text } = Typography;

type Props = { item: UserHasFriend; closeAddModal: Function };

// Icon Friend Status
const friendStatus = (
  isSender: boolean = true,
  loading: boolean,
  state: FriendStateEnum = FriendStateEnum.PENDING,
  request: MouseEventHandler<HTMLButtonElement>,
) => {
  // Swith Case
  switch (state) {
    case FriendStateEnum.PENDING:
      return (
        <Tooltip title={isSender ? 'Đã gửi yêu cầu' : 'Chờ bạn phản hồi'}>
          <Button
            loading={loading}
            icon={<Hourglass size={16} />}
            style={{
              display: 'flex',
              color: '#F29339',
              cursor: 'pointer',
              alignItems: 'center',
              borderColor: '#F29339',
            }}
          >
            {isSender ? 'Đã gửi yêu cầu' : 'Chờ bạn phản hồi'}
          </Button>
        </Tooltip>
      );
    case FriendStateEnum.ACCEPTED:
      return (
        <Tooltip title="Đã kết bạn">
          <Button
            icon={<Users size={18} />}
            style={{
              display: 'flex',
              color: green.primary,
              cursor: 'pointer',
              alignItems: 'center',
              borderColor: green.primary,
            }}
          >
            Bạn bè
          </Button>
        </Tooltip>
      );
    default:
      return (
        <Tooltip title="Kết bạn">
          <Button
            loading={loading}
            icon={<UserPlus size={18} />}
            onClick={request}
            style={{
              display: 'flex',
              color: blue.primary,
              cursor: 'pointer',
              alignItems: 'center',
              borderColor: blue.primary,
            }}
          >
            Kết bạn
          </Button>
        </Tooltip>
      );
  }
};

const UsersFinded: FC<Props> = memo(
  ({ item, closeAddModal }: Props) => {
    // User
    const user: AuthHookType<User> = useAuth();

    const config = useConfig();

    // Message
    const { message } = App.useApp();

    // Socket
    const socket: TshusSocket = useSocket();

    // Friend state
    const [friend, setFriend] = useState<UserHasFriend | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [opChatLoading, setOpChatLoading] = useState<boolean>(false);

    const showModal = () => setIsModalOpen(true);

    const handleCancel = () => setIsModalOpen(false);

    const [reqfLoading, setReqfLoading] = useState<boolean>(false);

    // Use Effect
    useEffect(() => {
      // Set friend
      setFriend(item);

      // Return clean
      return () => setFriend(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle Add Friend
    const friendRequest = async () => {
      // Enable loading
      setReqfLoading(true);

      // Exception
      try {
        // Send socket add friend
        socket?.emit('friend:server', {
          inviter: {
            user: user.get?._id,
            avatar: user.get?.avatar,
            nickname: user.get?.nickname,
          },
          friend: {
            user: item?._id,
            avatar: item?.avatar,
            nickname: item?.nickname,
          },
        });

        // Time delay
        setTimeout(() => {
          // Set hasFriend
          setFriend((prev: UserHasFriend | null) => ({
            ...(prev as UserHasFriend),
            state: FriendStateEnum.PENDING,
            isSender: true,
          }));

          // Message success
          message.success('Đã gửi yêu cầu kết bạn');

          // Disable loading
          setReqfLoading(false);
        }, 1000);
      } catch (error) {
        // Show error message
        message.error('Gửi yêu cầu kết bạn thất bại');
      }
    };

    const openChat = async () => {
      // Enable loading
      setOpChatLoading(true);

      // Response
      const res: Response = await fetcher({
        method: 'POST',
        url: '/chats/join',
        payload: {
          inviter: {
            user: user.get?._id,
            avatar: user.get?.avatar,
            nickname: user.get?.nickname,
          },
          friend: {
            user: friend?._id,
            avatar: friend?.avatar,
            nickname: friend?.nickname,
          },
        },
      });

      setTimeout(() => {
        if (res?.status !== 200) {
          // Message error
          message.error('Mở tin nhắn thất bại');
        } else {
          // Cancel
          handleCancel();

          // Close modal
          closeAddModal();
        }

        // Disable loading
        setOpChatLoading(false);
      }, 1300);
    };

    // Return
    return (
      <Fragment>
        <Modal
          footer={null}
          open={isModalOpen}
          onCancel={handleCancel}
          title="Thông tin tài khoản"
        >
          <Flex
            align="center"
            gap={15}
            vertical
            style={{ paddingTop: 30, paddingBottom: 20 }}
          >
            <Avatar
              size={80}
              shape="square"
              alt={friend?.nickname?.charAt(0)}
              src={`${BASE_URL}/${friend?.avatar}`}
            >
              {friend?.nickname?.charAt(0)}
            </Avatar>
            <Flex gap={1} vertical align="center">
              <Text style={{ fontSize: 23 }}>{friend?.nickname}</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {friend?.email}
              </Text>
            </Flex>
            <Flex gap={10}>
              <Button type="primary" onClick={openChat} loading={opChatLoading}>
                Nhắn tin
              </Button>
              {friendStatus(
                friend?.isSender,
                reqfLoading,
                friend?.state,
                friendRequest,
              )}
            </Flex>
          </Flex>
        </Modal>
        {item && (
          <Flex
            flex={1}
            align="center"
            justify="space-between"
            onClick={showModal}
            style={{ padding: '2px 3px', cursor: 'pointer' }}
            className={`${
              config.get.theme === 'dark' ? 'cvs-d-hover' : 'cvs-l-hover'
            }`}
          >
            <Flex align="center" gap={15}>
              <Avatar
                shape="square"
                alt={friend?.nickname?.charAt(0)}
                size={35}
                src={`${BASE_URL}/${friend?.avatar}`}
              >
                {friend?.nickname?.charAt(0)}
              </Avatar>
              <Flex gap={1} vertical justify="space-between">
                <Text style={{ fontSize: 13 }}>{friend?.nickname}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {friend?.email}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Fragment>
    );
  },
);

export default UsersFinded;
