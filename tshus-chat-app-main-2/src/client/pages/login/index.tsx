import { useState } from 'react';
import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Space,
  theme,
  Typography,
} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/client/hooks/use-auth';
import authServices from '@/client/context/auth/services';
import { login } from '@/client/context/auth/reducers';
import { RolesEnum } from '@/common/enum/roles.enum';

// Use Token
const { useToken } = theme;

// Text, Title
const { Text, Title } = Typography;

export default function Login() {
  // Toeken
  const { token } = useToken();

  // User Data
  const auth: any = useAuth();

  // Navigate
  const navigate = useNavigate();

  // Message
  const { message } = App.useApp();

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    // Enable Loading
    setLoading(true);

    // Result
    const loged = await authServices.login({
      email: values.email,
      password: values.password,
    });

    // Disable Loading
    setLoading(false);

    // Save data
    if (loged?.user) {
      // Show message
      message.success('Đăng nhập thành công');

      // Delay 0.3s
      setTimeout(() => {
        // Set data
        auth.set(login({ ...loged?.user, isAuthenticated: true }));

        // Check roles
        if (loged?.user?.roles?.[0] === RolesEnum.ADMIN) {
          // Check and rouing
          navigate('/admin/dashboard', { replace: true });
        } else {
          // Check and rouing
          navigate('/', { replace: true });
        }
      }, 300);
    } else {
      // Show message
      message.error('Đăng nhập thất bại, vui lòng thử lại');
    }
  };

  // Return
  return (
    <Space
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div style={{ width: '400px' }}>
        <div
          style={{
            marginBottom: token.marginXL,
            textAlign: 'center',
          }}
        >
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0.464294" width="24" height="24" rx="4.8" fill="#1890FF" />
            <path
              d="M14.8643 3.6001H20.8643V9.6001H14.8643V3.6001Z"
              fill="white"
            />
            <path
              d="M10.0643 9.6001H14.8643V14.4001H10.0643V9.6001Z"
              fill="white"
            />
            <path
              d="M4.06427 13.2001H11.2643V20.4001H4.06427V13.2001Z"
              fill="white"
            />
          </svg>

          <Title style={{ textAlign: 'center' }}>Đăng nhập</Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              textAlign: 'center',
            }}
          >
            Chào mừng trở lại với Tshus chat app, hãy đăng nhập để trò chuyện
            ngay
          </Text>
        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="email"
            hasFeedback
            rules={[
              {
                type: 'email',
                required: true,
                message: 'Vui lòng nhập đúng định dạng Email!',
              },
            ]}
          >
            <Input prefix={<LockOutlined />} placeholder="Địa chỉ email" />
          </Form.Item>
          <Form.Item
            name="password"
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!',
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
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item>
            <Link
              style={{
                float: 'right',
              }}
              to="/auth/forgot"
            >
              Quên mật khẩu?
            </Link>
          </Form.Item>
          <Form.Item style={{ marginBottom: '0px' }}>
            <Button
              block={true}
              type="primary"
              htmlType="submit"
              disabled={loading}
            >
              Đăng nhập
            </Button>
            <div
              style={{
                marginTop: token.marginLG,
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: token.colorTextSecondary,
                  marginRight: 5,
                }}
              >
                Bạn chưa có tài khoản?
              </Text>
              <Link to="/auth/register">Đăng ký ngay</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Space>
  );
}
