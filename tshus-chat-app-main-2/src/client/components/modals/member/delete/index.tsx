import { useAuth } from '@/client/hooks/use-auth';
import { ThemeEnum } from '@/common/enum/theme.enum';
import { useConfig } from '@/common/hooks/use-config';
import { Roommembers } from '@/common/interface/Roommembers';
import { ConfigType } from '@/common/types/other/config.type';
import { HookType } from '@/common/types/other/hook.type';
import { Response } from '@/common/types/response/response.type';
import { fetcher } from '@/common/utils/fetcher';
import { TrashSimple } from '@phosphor-icons/react';
import {
  App,
  Avatar,
  Badge,
  Button,
  Flex,
  Modal,
  Radio,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useState } from 'react';

type Props = {
  roommembers: Roommembers[];
};

const { Text } = Typography;

const { useToken } = theme;

const DeleteMemberFromGroupModal: FC<Props> = ({ roommembers }: Props) => {
  // Open State
  const [open, setOpen] = useState(false);

  const showModal = () => {
    // Check
    if (roommembers?.length > 1) {
      // Set open
      setOpen(true);
    } else {
      // Show error
      message.error('Không có thành viên nào trong nhóm');
    }
  };

  // Message
  const { message } = App.useApp();

  // Toeken
  const { token } = useToken();

  // Open State
  const [deleteMember, setDeleteMember] = useState<string | null>(null);

  const handleOk = () => setOpen(false);

  // Config
  const config: HookType<ConfigType> = useConfig();

  // Auth
  const auth = useAuth();

  const handleCancel = () => {
    // Set open
    setOpen(false);
  };

  // Submit handle
  const onSubmit = async () => {
    // Check delete member
    if (deleteMember) {
      /// Response
      const res: Response = await fetcher({
        method: 'DELETE',
        url: `/roommembers/delete`,
        payload: {
          user: auth.get?._id,
          member: deleteMember,
        },
      });

      //  Check response status
      if (res?.status === 200) {
        //  Close modal
        handleCancel();

        // Show message success
        message.success('Xoá thành viên thành công');
      } else {
        // Show message error
        message.error('Xoá thành viên thất bại, vui lòng thử lại');
      }
    }
  };

  // Return
  return (
    <>
      <Tooltip title="Xoá thành viên">
        <Button icon={<TrashSimple size={20} />} onClick={showModal} />
      </Tooltip>
      <Modal
        title="Xoá thành viên khỏi nhóm chat"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[]}
      >
        <Flex style={{ paddingTop: 10 }} vertical gap={15}>
          <Radio.Group style={{ width: '100%' }} value={deleteMember}>
            <Flex vertical>
              {roommembers?.map(
                (item) =>
                  auth?.get?._id !== item?.user && (
                    <Flex
                      key={item._id}
                      justify="space-between"
                      style={{ borderRadius: 5 }}
                      className={`${
                        config.get.theme === ThemeEnum.DARK
                          ? 'cvs-d-hover'
                          : 'cvs-l-hover'
                      } ${
                        item._id === deleteMember &&
                        ` ${
                          config.get.theme === ThemeEnum.DARK
                            ? 'cvs-d-active'
                            : 'cvs-l-active'
                        }`
                      }`}
                    >
                      <Flex
                        gap={15}
                        align="center"
                        style={{
                          padding: 10,
                          cursor: 'pointer',
                          width: '100%',
                        }}
                        onClick={() => setDeleteMember(item._id)}
                      >
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
                            {item.nickname?.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Flex gap={1} vertical justify="space-between">
                          <Text style={{ fontSize: 13 }}>{item.nickname}</Text>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Radio value={item?._id} />
                      </Flex>
                    </Flex>
                  ),
              )}
            </Flex>
          </Radio.Group>
          <Flex justify="end">
            <Button danger onClick={onSubmit}>
              Xoá thành viên
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
};

export default DeleteMemberFromGroupModal;
