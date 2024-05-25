import { useAuth } from '@/client/hooks/use-auth';
import { formatToDateTime } from '@/common/utils/date';
import { fetcher } from '@/common/utils/fetcher';
import { UserList } from '@phosphor-icons/react';
import { Card, Flex, Table, TableProps, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text, Title } = Typography;

// Use Token
const { useToken } = theme;

interface DataType {
  _id: string;
  nickname: string;
  roles: string[];
  created_at: string;
  online: boolean;
  email: string[];
}

interface MFDType {
  _id: string | number;
  totalMessages: string | number;
}

interface URSType {
  _id: string | number;
  totalUsers: string | number;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Tên người dùng',
    dataIndex: 'nickname',
    key: 'nickname',
  },
  {
    title: 'Quyền hạn',
    dataIndex: 'role',
    key: 'role',
    render: (_, record: DataType) => record?.roles?.[0],
  },
  {
    title: 'Trạng thái',
    dataIndex: 'online',
    key: 'online',
    render: (_, record: DataType) =>
      record?.online ? (
        <Tag color="success">ONLINE</Tag>
      ) : (
        <Tag color="default">OFFLINE</Tag>
      ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Tạo lúc',
    key: 'created_at',
    dataIndex: 'created_at',
    render: (text: string) => formatToDateTime(text),
  },
];

const mfdCoumns: TableProps<MFDType>['columns'] = [
  {
    title: 'Tháng',
    dataIndex: '_id',
    key: '_id',
    render: (_, record: MFDType) => <Text>Tháng {record?._id}</Text>,
  },
  {
    title: 'Số lượng tin nhắn',
    dataIndex: 'totalMessages',
    key: 'totalMessages',
    render: (_, record: MFDType) => <Text>{record?.totalMessages} tin nhắn</Text>,
  },
];

const ursCoumns: TableProps<URSType>['columns'] = [
  {
    title: 'Tháng',
    dataIndex: '_id',
    key: '_id',
    render: (_, record: URSType) => <Text>Tháng {record?._id}</Text>,
  },
  {
    title: 'Số tài khoản được tạo',
    dataIndex: 'totalUsers',
    key: 'totalUsers',
    render: (_, record: URSType) => <Text>{record?.totalUsers} tin nhắn</Text>,
  },
];

const SwitchIcon = (key: string) => {
  switch (key) {
    case 'UserList':
      return <UserList size={32} />;
    default:
      break;
  }
};

export default function Dashboard() {
  // Token
  const { token } = useToken();

  // Cons statis
  const [statis, setStatis] = useState<any>([]);

  // Auth
  const auth = useAuth();

  // Cons statis
  const [userStatis, setUserStatis] = useState<DataType[]>([]);

  // Cons statis
  const [mfdStatis, setMfdStatis] = useState<MFDType[]>([]);

  // Cons statis
  const [userRegisStatus, setUserRegisStatus] = useState<URSType[]>([]);

  // Effect load statis
  useEffect(() => {
    (async () => {
      // Fetch
      const loaded = await fetcher({
        method: 'GET',
        url: '/statistical/overview',
      });

      // Fetch
      const usersLoaded = await fetcher({
        method: 'GET',
        url: '/statistical/user',
        payload: {
          user: auth?.get?._id,
        },
      });

      const usersRegisterLoaded = await fetcher({
        method: 'GET',
        url: '/statistical/user_register_statis',
        payload: {
          user: auth?.get?._id,
        },
      });

      // Fetch
      const mfdLoaded = await fetcher({
        method: 'GET',
        url: '/statistical/message_for_date',
      });

      // Check status
      if (mfdLoaded?.status === 200) {
        // Load statis
        setMfdStatis(mfdLoaded.data);
      }

      // Check status
      if (usersRegisterLoaded?.status === 200) {
        // Load statis
        setUserRegisStatus(usersRegisterLoaded.data);
      }

      // Check status
      if (usersLoaded?.status === 200) {
        // Load statis
        setUserStatis(usersLoaded.data);
      }

      // Check status
      if (loaded?.status === 200) {
        // Load statis
        setStatis(loaded.data);
      }
    })();
  }, []);

  // Return
  return (
    <Flex style={{ height: '100vh', padding: '20px' }} vertical gap={40}>
      <Flex gap={20} justify="space-between">
        {statis?.map((item: any, index: number) => (
          <Card title={item.title} style={{ width: 300 }}>
            <Flex gap={20} align="center">
              {SwitchIcon(item.icon)}
              <Title style={{ margin: 0 }}>{item.data}</Title>
            </Flex>
            <Text style={{ color: token.colorTextDescription }}>
              {item.desc}
            </Text>
          </Card>
        ))}
      </Flex>
      <Flex gap={20} justify='space-between'>
        <Card title="Thống kê người dùng">
          <Table columns={columns} dataSource={userStatis} />
        </Card>
        <Card title="Thống kê số lượng tin nhắn theo tháng">
          <Table columns={mfdCoumns} dataSource={mfdStatis} />
        </Card>
        <Card title="Thống kê đăng ký tài khoản">
          <Table columns={ursCoumns} dataSource={userRegisStatus} />
        </Card>
      </Flex>
    </Flex>
  );
}
