import { FC, useState } from 'react';
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Spin,
  Typography,
} from 'antd';
import { UserPlus } from '@phosphor-icons/react';
import { fetcher } from '@/common/utils/fetcher';
import UserFinded from '@/client/components/modals/friend/add/private/find';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@/client/hooks/use-auth';
import { Response } from '@/common/types/response/response.type';
import EmptyHorizontal from '@/client/components/empty/horizontal.empty';
import { UserHasFriend } from '@/common/types/user/user-has-friend.type';
import { HookType } from '@/common/types/other/hook.type';
import { User } from '@/common/interface/User';

type OnSingleChange = any;

const AddFriendsModal: FC = () => {
  // List user state
  const [userFind, setUserFind] = useState<UserHasFriend | null>(null);

  // Open State
  const [open, setOpen] = useState(false);

  // User
  const user: HookType<User> = useAuth();

  // Search loading state
  const [searchLoading, setSearchLoading] = useState(false);

  const showModal: OnSingleChange = () => setOpen(true);

  const handleOk: OnSingleChange = () => setOpen(false);

  const handleCancel = () => {
    // Clear user list
    setUserFind(null);

    // Set open
    setOpen(false);
  };

  // Search
  const onSearch = async (values: { search: string }) => {
    // Check find value
    if (values.search !== '') {
      // Enable loading
      setSearchLoading(true);

      // Search
      const res: Response = await fetcher({
        method: 'GET',
        url: '/users/find',
        payload: {
          search: values.search,
          user: user.get?._id,
        },
      });

      // Set timeout
      setTimeout(() => {
        // Disable loading
        setSearchLoading(false);

        // Set User
        setUserFind(res?.status === 200 ? res.data : null);
      }, 2000);
    }
  };

  // Return
  return (
    <>
      <Button type="text" icon={<UserPlus size={20} />} onClick={showModal} />
      <Modal
        title="Thêm bạn bè"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Huỷ
          </Button>,
        ]}
      >
        <div style={{ paddingTop: 10 }}>
          <Form
            name="search_user"
            layout="vertical"
            requiredMark="optional"
            onFinish={onSearch}
          >
            <Flex gap={2}>
              <Form.Item
                name="search"
                hasFeedback
                style={{ width: '100%' }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập nội dung tìm kiếm!',
                  },
                  {
                    type: 'email',
                    message: 'Vui lòng nhập Email cần tìm kiếm!',
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại hoặc email" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
            </Flex>
          </Form>
          <Flex vertical>
            <Typography.Text>Kết quả tìm kiếm</Typography.Text>
            <Flex
              justify="center"
              align="center"
              style={{ marginTop: 15, marginBottom: 15 }}
            >
              {!searchLoading ? (
                userFind ? (
                  <Flex align="center" flex={1}>
                    <UserFinded item={userFind} closeAddModal={handleCancel} />
                  </Flex>
                ) : (
                  <EmptyHorizontal desc="Không tìm thấy người dùng" />
                )
              ) : (
                <Flex style={{ marginTop: 20 }}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                </Flex>
              )}
            </Flex>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default AddFriendsModal;
