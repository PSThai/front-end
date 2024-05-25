import {
  App,
  Avatar,
  Badge,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Popover,
  Select,
  Skeleton,
  Space,
  theme,
  Typography,
} from 'antd';
import {
  Calendar,
  SignOut,
  User as UserIcon,
  WechatLogo,
} from '@phosphor-icons/react';
import { FC, Fragment, useState } from 'react';
import { useAuth } from '@/client/hooks/use-auth';
import { logout, update } from '@/client/context/auth/reducers';
import { AuthHookType } from '@/common/types/other/hook.type';
import { User } from '@/common/interface/User';
import { BASE_URL, fetcher } from '@/common/utils/fetcher';
import { formatToDateTime } from '@/common/utils/date';
import { GenderEnum } from '@/common/enum/user/gender.enum';
import { useSocket } from '@/common/hooks/use-socket';
import { TshusSocket } from '@/common/types/other/socket.type';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { getCookie, setCookieNoExp } from '@/common/utils/cookie';

const { useToken } = theme;

type ModalLogoutProps = {
  auth: AuthHookType<User>;
};

const { Text } = Typography;

const ModelLogout: FC<ModalLogoutProps> = ({ auth }: ModalLogoutProps) => {
  // Open
  const [open, setOpen] = useState(false);

  // Confirm Loading
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Socket
  const socket: TshusSocket = useSocket();

  // Show Modal
  const showModal = () => setOpen(true);

  // Handle Cancel
  const handleCancel = () => setOpen(false);

  // Handle Ok
  const handleOk = async () => {
    // Set Moda
    setConfirmLoading(true);

    setTimeout(async () => {
      setTimeout(async () => {
        // Set Moda
        setConfirmLoading(true);

        // Close Modal
        setOpen(false);

        // Logout
        if (auth?.set) {
          auth.set(logout());

          // Socket
          socket?.disconnect();
        }
      }, 1000);
    }, 1000);
  };

  // Return
  return (
    <Fragment>
      <Button
        onClick={showModal}
        style={{ padding: '5px 8px', height: 'unset', width: '100%' }}
      >
        <Flex align="center" gap={10} justify="start">
          <SignOut size={18} />
          Đăng xuất
        </Flex>
      </Button>
      <Modal
        title="Đăng xuất"
        okText="Đăng xuất"
        cancelText="Huỷ"
        open={open}
        okType="danger"
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Typography.Text>
          Bạn có chắc chắn muốn đăng xuất khỏi {auth.get?.nickname}?
        </Typography.Text>
      </Modal>
    </Fragment>
  );
};

const ModalUserInfo: FC = () => {
  // Token
  const { token } = useToken();

  // Open
  const [open, setOpen] = useState(false);

  const [childrenDrawer, setChildrenDrawer] = useState(false);

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // User
  const user = useAuth();

  // Form
  const [form] = Form.useForm();

  // Message
  const { message } = App.useApp();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };

  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };

  // Finish
  const onFinish = async (values: any) => {
    // Enable Loading
    setLoading(true);

    // Message key
    const key = Date.now().toString();

    // Loading message
    message.loading({
      content: `Đang cập nhật thông tin người dùng, vui lòng đợi...`,
      key,
    });

    // Promise
    const promise = new Promise(async (resolve, reject) => {
      // Updated
      const updated = await fetcher({
        method: 'PUT',
        url: '/users/update',
        payload: { _id: user.get?._id, ...values },
      });

      console.log(updated);

      // Check status
      return updated?.status === 200 ? resolve(values) : reject(updated);
    });

    // Message
    promise
      .then(async () => {
        // Destructuring
        const { password, ...destr} = values;

        // Set form UI
        setTimeout(() => {
          // Show message
          message.success({
            content: 'Cập nhật thông tin người dùng thành công!',
            key,
          });
        }, 500);

        // Update
        const cookieData = getCookie('user');

        console.log({ ...cookieData, ...destr });

        // Set new cookie
        setCookieNoExp('user', { ...cookieData, ...destr });

        // Update
        user?.set(update(values));

        // Close
        onChildrenDrawerClose();

        // Reset form
        form.resetFields();
      })
      .catch((error) => {
        // Show error mesage
        message.error({
          content: error.message,
          key,
        });
      })
      .finally(() => {
        // Disable Loading
        setLoading(false);
      });
  };



  // Return
  return (
    <>
      <Space>
        <Button
          onClick={showDrawer}
          style={{ padding: '5px 8px', height: 'unset', width: '100%' }}
        >
          <Flex align="center" gap={10} justify="start">
            <UserIcon size={18} />
            Thông tin tài khoản
          </Flex>
        </Button>
      </Space>
      <Drawer
        title="Thông tin người dùng"
        placement="left"
        width={400}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Đóng</Button>
          </Space>
        }
      >
        <Flex vertical gap={20}>
          <Flex align="center" gap={15} vertical>
            <Avatar
              size={80}
              shape="square"
              alt={user?.get?.nickname?.charAt(0)}
              src={`${BASE_URL}/${user?.get?.avatar}`}
            >
              {user?.get?.nickname?.charAt(0)}
            </Avatar>
            <Flex gap={1} vertical align="center">
              <Text style={{ fontSize: 23 }}>{user?.get?.nickname}</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {user?.get?.email}
              </Text>
            </Flex>
          </Flex>
          <Flex vertical gap={10}>
            <Text
              style={{
                color: token.colorTextDescription,
              }}
            >
              THÔNG TIN NGƯỜI DÙNG
            </Text>
            <Flex align="left" gap={15} vertical>
              <Flex vertical gap={10}>
                <Flex align="center" gap={15}>
                  <UserIcon
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Tên đầy đủ: {user?.get?.nickname}
                  </Text>
                </Flex>
                <Flex align="center" gap={15}>
                  <WechatLogo
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Giới tính:{' '}
                    {user?.get?.gender === GenderEnum.MALE ? 'Nam' : 'Nữ'}
                  </Text>
                </Flex>
                <Flex align="center" gap={15}>
                  <WechatLogo
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Điện thoại: {user?.get?.phone}
                  </Text>
                </Flex>
                <Flex align="center" gap={15}>
                  <Calendar
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Ngày tạo:{' '}
                    {formatToDateTime(user?.get?.created_at?.toString())}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Button type="primary" onClick={showChildrenDrawer}>
            Thay đổi thông tin tài khoản
          </Button>
        </Flex>
        <Drawer
          title="Cập nhật thông tin người dùng"
          width={400}
          placement="left"
          closable={false}
          onClose={onChildrenDrawerClose}
          open={childrenDrawer}
        >
          <Form
            form={form}
            name="update_information"
            initialValues={{
              remember: true,
              email: user?.get?.email,
              nickname: user?.get?.nickname,
              gender: user?.get?.gender,
              phone: user?.get?.phone,
            }}
            onFinish={onFinish}
            layout="vertical"
            requiredMark="optional"
          >
            <Form.Item
              name="email"
              hasFeedback
              label="Email"
              
              rules={[
                {
                  type: 'email',
                  message: 'Định dạng Email không ddungs!',
                },
                {
                  required: true,
                  message: 'Địa chỉ Email không được trống!',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                disabled
                placeholder="Địa chỉ email"
              />
            </Form.Item>
            <Form.Item
              label="Họ và tên"
              name="nickname"
              hasFeedback
              style={{ display: 'inline-block', width: '100%' }}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập họ và tên của bạn!',
                },
                {
                  max: 100,
                  message: 'Họ và tên không được quả 100 ký tự!',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Họ và tên"
              />
            </Form.Item>
            <Flex gap={10} justify="space-between">
              <Form.Item
                label="Giới tính"
                name="gender"
                hasFeedback
                style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn giới tính',
                  },
                  {
                    enum: [
                      GenderEnum.MALE,
                      GenderEnum.FEMALE,
                      GenderEnum.OTHER,
                    ],
                    message: 'Giới tính đã chọn không hợp lệ',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn giới tính"
                  options={[
                    { value: GenderEnum.MALE, label: 'Nam' },
                    { value: GenderEnum.FEMALE, label: 'Nữ' },
                    { value: GenderEnum.OTHER, label: 'Khác' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                hasFeedback
                style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số điện thoại',
                  },
                  {
                    len: 10,
                    message: 'Số điện thoại gồm 10 số từ 0 - 9',
                  },
                ]}
              >
                <Input
                  addonBefore="+84"
                  placeholder="Số điện thoại"
                />
              </Form.Item>
            </Flex>
            <Form.Item
              name="password"
              hasFeedback
              label="Nhập mật khẩu để xác thực người dùng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu để xác thực người dùng!',
                },
                {
                  min: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự!',
                },
                {
                  pattern:
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
                  message:
                    'Mật khẩu phải bao gồm chữ số, số, chữ hoa, chữ thường, kí tự đặc biệt',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Mật khẩu"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: '0px' }}>
              <Button
                block={true}
                type="primary"
                htmlType="submit"
                disabled={loading}
              >
                Thay đổi thông tin tài khoản
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </Drawer>
    </>
  );
};

const UserProfile: FC = () => {
  // Open State
  const [open, setOpen] = useState<boolean>(false);

  // Auth
  const auth: AuthHookType<User> = useAuth();

  // Open
  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);

  // Return
  return (
    <Popover
      content={
        <Flex>
          <Flex align="center" gap={5} vertical>
            <ModelLogout auth={auth} />
            <ModalUserInfo />
          </Flex>
        </Flex>
      }
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="topRight"
    >
      <Flex align="center" justify="space-between">
        <Button type="text" style={{ height: 'unset', padding: '0' }}>
          <Flex align="center" gap={15}>
            {auth?.get ? (
              <Badge dot status="success" offset={[-1, 1]}>
                <Avatar
                  shape="square"
                  alt={auth.get?.nickname?.charAt(0)}
                  size={35}
                  src={`${BASE_URL}/${auth.get?.avatar}`}
                >
                  {auth.get?.nickname?.charAt(0)}
                </Avatar>
              </Badge>
            ) : (
              <Flex gap={10} align="center">
                <Skeleton.Avatar
                  active
                  size={35}
                  shape="square"
                  className="flex-align"
                />
                <Skeleton.Input
                  active
                  style={{ width: 100, height: 35 }}
                  className="flex-align"
                />
              </Flex>
            )}
          </Flex>
        </Button>
      </Flex>
    </Popover>
  );
};

export default UserProfile;
