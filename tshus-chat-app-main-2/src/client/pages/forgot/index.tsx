import {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  App,
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  Select,
  Space,
  theme,
  Typography,
} from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authServices from '@/client/context/auth/services';
import { GenderEnum } from '@/common/enum/user/gender.enum';
import { MessageInstance } from 'antd/es/message/interface';
import { fetcher } from '@/common/utils/fetcher';

// Use Token
const { useToken } = theme;

// Text, Title
const { Text, Title } = Typography;

const Countdown = ({ minutes }: { minutes: number }) => {
  // Second state
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          window.location.reload();
        }
        return prevSeconds;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutesLeft = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const timeLeft = `${minutesLeft
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return (
    <Flex justify="center">
      <Title>{timeLeft}</Title>
    </Flex>
  );
};

type RFProps = {
  email: string;
  token: any;
  message: MessageInstance;
};

type OTPFormProps = {
  email: string;
  token: any;
  message: MessageInstance;
  setFormUI: Dispatch<SetStateAction<JSX.Element | null>>;
};

const OTPForm: FC<OTPFormProps> = ({ email, token, message }: OTPFormProps) => {
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // OTP Form
  const [form] = Form.useForm();

  // Navigate
  const navigate = useNavigate();

  // OTP values
  const [otpValues, setOTPValues] = useState<string>('');

  const onFinish = async () => {
    // Check otp values
    if (otpValues.length !== 6) {
      // Show error
      message.error('Vui lòng nhập đầy đủ 6 số của mã xác thực OTP');
    } else {
      // Enable Loading
      setLoading(true);

      // Destructuring
      const otp = otpValues;

      // Loading message
      message.loading({
        content: `Đang kiểm tra mã xác thực, vui lòng đợi...`,
        key: otp,
      });

      // Promise
      const promise = new Promise(async (resolve, reject) => {
        // Created
        const created = await fetcher({
          method: 'POST',
          url: '/auth/forgot/check',
          payload: { otp, email },
        });

        // Check status
        return created?.status === 200 ? resolve(created) : reject(created);
      });

      // Message
      promise
        .then(async () => {
          // Set form UI
          setTimeout(() => {
            // Show message
            message.success({
              content:
                'Xác thực OTP thành công, mật khẩu mới sẽ được gửi về email của bạn!',
              key: otp,
            });

            // Delay 0.3s
            setTimeout(() => {
              // Check loged and redirect
              navigate('/auth/login', { replace: true });
            }, 300);
          }, 500);
        })
        .catch(() => {
          // Show error mesage
          message.error({
            content: 'Xác thực OTP thất bại, vui lòng thử lại',
            key: otp,
          });
        })
        .finally(() => {
          // Disable Loading
          setLoading(false);
        });
    }
  };

  // Return
  return (
    <Space
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
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

          <Title style={{ textAlign: 'center' }}>Xác thực Email</Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              textAlign: 'center',
            }}
          >
            Vui lòng xác thực địa chỉ Email để có thể đăng ký tài khoản
          </Text>
        </div>
        <Form
          form={form}
          name="verify_otp_form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
          onFinishFailed={(val) => {
            console.log(val);
          }}
        >
          <Flex align="center" justify="center" vertical>
            <Form.Item
              hasFeedback
              style={{ marginBottom: 10 }}
              name="otp"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập đầy đủ 6 số của mã xác thực OTP',
                },
              ]}
            >
              <Flex
                gap={15}
                align="left"
                justify="center"
                style={{ marginBottom: 5 }}
              >
                <Input.OTP size="large" onChange={(val) => setOTPValues(val)} />
              </Flex>
            </Form.Item>
            <Countdown minutes={1} />
          </Flex>
          <Form.Item>
            <Button
              block={true}
              type="primary"
              htmlType="submit"
              disabled={loading}
            >
              Xác thực
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
                Bạn đã có tài khoản?
              </Text>
              <Link to="/auth/login">Đăng nhập ngay</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Space>
  );
};

export default function Forgot() {
  // Toeken
  const { token } = useToken();

  // Message
  const { message } = App.useApp();

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Form UI
  const [formUI, setFormUI] = useState<JSX.Element | null>(null);

  const onFinish = async (values: any) => {
    // Destructuring
    const { email } = values;

    // Enable Loading
    setLoading(true);

    // Message key
    const key = Date.now().toString();

    // Loading message
    message.loading({
      content: `Đang tạo OTP xác thực, vui lòng đợi...`,
      key,
    });

    // Promise
    const promise = new Promise(async (resolve, reject) => {
      // Created
      const created = await fetcher({
        method: 'POST',
        url: '/auth/forgot/send',
        payload: { email },
      });

      // Check status
      return created?.status === 200 ? resolve(created) : reject(created);
    });

    // Message
    promise
      .then(async () => {
        // Set form UI
        setTimeout(() => {
          // Show message
          message.success({
            content: 'Xác thực OTP thành công, tiếp tục đăng ký!',
            key,
          });

          // Change UI
          setFormUI(
            <OTPForm
              setFormUI={setFormUI}
              message={message}
              token={token}
              email={email}
            />,
          );
        }, 500);
      })
      .catch(() => {
        // Show error mesage
        message.error({
          content: 'Tạo OTP thất bại, vui lòng thử lại',
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
    <Fragment>
      {formUI ? (
        formUI
      ) : (
        <Space
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
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
                <rect
                  x="0.464294"
                  width="24"
                  height="24"
                  rx="4.8"
                  fill="#1890FF"
                />
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

              <Title style={{ textAlign: 'center' }}>Xác thực Email</Title>
              <Text
                style={{
                  color: token.colorTextSecondary,
                  textAlign: 'center',
                }}
              >
                Vui lòng xác thực địa chỉ Email để có thể lấy lại mật khẩu
              </Text>
            </div>
            <Form
              name="create_otp_form"
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
                <Input prefix={<MailOutlined />} placeholder="Địa chỉ email" />
              </Form.Item>
              <Form.Item style={{ marginBottom: '0px' }}>
                <Button
                  block={true}
                  type="primary"
                  htmlType="submit"
                  disabled={loading}
                >
                  Xác thực
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
                    Bạn đã có tài khoản?
                  </Text>
                  <Link to="/auth/login">Đăng nhập ngay</Link>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Space>
      )}
    </Fragment>
  );
}
