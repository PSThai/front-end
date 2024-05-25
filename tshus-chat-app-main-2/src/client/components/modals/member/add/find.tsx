import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  App,
  Avatar,
  Button,
  Flex,
  Form,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';
import { BASE_URL, fetcher } from '@/common/utils/fetcher';
import { User } from '@/common/interface/User';
import { Response } from '@/common/types/response/response.type';
import { useAuth } from '@/client/hooks/use-auth';
import { useConversations } from '@/client/hooks/user-conversations';
import { AuthHookType, SpecialHookType } from '@/common/types/other/hook.type';
import { Friends } from '@/common/interface/Friends';
import { Conversations } from '@/common/interface/Conversations';

const { Text } = Typography;

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (user: User, search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
    title: string;
  } = any,
>({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);
  const auth: AuthHookType<User> = useAuth();

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(auth.get, value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      optionRender={(option) => (
        <Space>
          <span role="img" aria-label={option.data.label}>
            <Avatar
              size={28}
              shape="square"
              alt={option.data?.label?.charAt(0)}
              style={{ fontSize: 13 }}
              src={`${BASE_URL}/${option.data?.avatar}`}
            >
              {option.data?.label?.charAt(0)}
            </Avatar>
          </span>
          <Text>{option.data.label}</Text>
        </Space>
      )}
      {...props}
    />
  );
}

// Usage of DebounceSelect
interface UserValue {
  label: string;
  value: string;
  title: string;
}

async function fetchUserList(user: User, search: string): Promise<UserValue[]> {
  // Fetch Data
  const res: Response = await fetcher({
    method: 'GET',
    url: '/friends/search',
    payload: {
      search,
      user: user?._id,
      limit: 5,
    },
  });

  // Return
  return res?.data?.map((data: Friends) => {
    // Is Inviter
    const isInviter = data?.inviter?.user === user?._id;

    // Result
    const result = isInviter ? data.friend : data.inviter;

    // Return
    return {
      label: `${result.nickname}`,
      value: result.user,
      title: result.avatar,
    };
  });
}

type FormFindType = {
  name: string;
  members: UserValue[];
};

type FindAndSelectMemberProps = {
  changeOpen: Dispatch<SetStateAction<boolean>>;
};

const FindAndSelectMember: React.FC<FindAndSelectMemberProps> = ({
  changeOpen,
}) => {
  // Value state
  const [value, setValue] = useState<UserValue[]>([]);

  // User
  const user = useAuth();

  // Message
  const { message } = App.useApp();

  // Conversations
  const cvsContext: SpecialHookType<Conversations> = useConversations();

  const onFinish = async (values: FormFindType) => {
    // Exception
    try {
      // Response
      const res: Response = await fetcher({
        method: 'POST',
        url: '/roommembers/add',
        payload: {
          user: user?.get?._id,
          room: cvsContext.current.get?.rooms?.[0]?._id,
          member: {
            role: 'MEMBER',
            member: {
              user: values.members[0].value,
              avatar: values.members[0].title,
              nickname: values.members[0].label,
            },
          },
        },
      });

      // Check response status
      if (res?.status === 200) {
        // Close modal
        changeOpen(false);

        // Show message success
        message.success('Thêm thành viên vào nhóm thành công!');
      } else {
        // Show message error
        message.error('Thêm thành viên vào nhóm thất bại!');
      }
    } catch (error) {
      // Show message error
      message.error('Thêm thành viên vào nhóm thất bại  !');
    }
  };

  return (
    <Flex vertical>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Chọn thành viên nhóm"
          name="members"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn ít nhất 1 thành viên để thêm vào nhóm',
            },
          ]}
        >
          <DebounceSelect
            mode="multiple"
            value={value}
            placeholder="Chọn thành viên nhóm"
            fetchOptions={fetchUserList}
            onChange={(newValue) => {
              setValue(newValue as UserValue[]);
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Flex justify="end">
          <Button type="primary" htmlType="submit">
            Thêm thành viên
          </Button>
        </Flex>
      </Form>
    </Flex>
  );
};

export default FindAndSelectMember;
