import { MessageType } from '@/common/enum/message-type';
import { useAuth } from '@/client/hooks/use-auth';
import { ArrowBendUpLeft, Download, PushPin } from '@phosphor-icons/react';
import {
  App,
  Avatar,
  Badge,
  Button,
  Col,
  Flex,
  Image,
  Modal,
  Popover,
  Radio,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import React, { Dispatch, FC, Fragment, SetStateAction, useState } from 'react';
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DeleteOutlined,
  UndoOutlined,
  ForwardOutlined,
} from '@ant-design/icons';
import { AWS_URL, BASE_URL, fetcher } from '@/common/utils/fetcher';
import { ThemeEnum } from '@/common/enum/theme.enum';
import { useConfig } from '@/common/hooks/use-config';
import { css } from '@emotion/css';
import { formatToTime } from '@/common/utils/date';
import EmptyHorizontal from '@/client/components/empty/horizontal.empty';
import { useConversations } from '@/client/hooks/user-conversations';
import { ConversationEnum } from '@/common/enum/conversation.enum';
import { Conversations } from '@/common/interface/Conversations';
import { useSocket } from '@/common/hooks/use-socket';
import { HookType } from '@/common/types/other/hook.type';
import { ConfigType } from '@/common/types/other/config.type';
import { TshusSocket } from '@/common/types/other/socket.type';
import { MesssageState } from '@/common/enum/message-state.enum';
import { MesssageActionEnum } from '@/common/enum/user/message-actions.enum';
import { MessageReplyType } from '@/common/types/messages/message.reply.type';
import { Messages } from '@/common/interface/Messages';

type Props = {
  data: Messages;
  setReplyFor: Dispatch<SetStateAction<MessageReplyType | null>>;
};

type FileMessage = {
  files: any;
  msg?: string;
  token: any;
  isSender: boolean;
};

type TextMessage = {
  msg: string;
  token: any;
  isSender: boolean;
};

const { Text } = Typography;

const { useToken } = theme;

// Download file
const download = (file: any) => {
  fetch(`${AWS_URL}/${file.filename}`)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalname;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    });
};

const MessageFileLine: FC<FileMessage> = ({
  token,
  files,
  isSender,
  msg,
}: FileMessage) => {
  // Justiry
  const justify: string | any = isSender ? 'end' : 'start';

  // Color text
  const color: string = isSender ? 'white' : 'rgb(97, 97, 97)';

  // Return
  return (
    <Flex vertical>
      <Flex gap={7} vertical>
        <Row gutter={[10, 10]} justify={justify}>
          {files?.map((file: any, index: number) =>
            !file.mimetype.startsWith('image') ? (
              file.mimetype.startsWith('video') ? (
                <Col
                  key={index}
                  span={files.length < 3 ? 24 / files?.length : 8}
                >
                  <Space
                    className={css`
                      padding: 6px;
                      border-radius: 5px;
                      border: 1px solid ${token.colorBorder};
                    `}
                  >
                    <video width="320" height="240" controls>
                      <source
                        src={`${AWS_URL}/${file.filename}`}
                        type={file.mimetype}
                      />
                    </video>
                  </Space>
                </Col>
              ) : (
                <Col
                  span={24}
                  key={index}
                  style={{ display: 'flex', justifyContent: justify }}
                >
                  <Button
                    onClick={() => download(file)}
                    type={isSender ? 'primary' : 'default'}
                    style={{
                      height: 'unset',
                      padding: '6px 13px',
                    }}
                  >
                    <Flex gap={10} align="center">
                      <Flex
                        style={{
                          padding: 6,
                          background: 'white',
                          borderRadius: '50%',
                          border: isSender
                            ? 'none'
                            : `1px solid ${token.colorBorder}`,
                        }}
                      >
                        <Download
                          weight="regular"
                          size={19}
                          color={token.colorPrimary}
                        />
                      </Flex>
                      <Flex justify="center" vertical align="start">
                        <Text style={{ color, fontSize: 14 }}>
                          {file.originalname}
                        </Text>
                        <Text style={{ color, fontSize: 9 }}>{file.size}</Text>
                      </Flex>
                    </Flex>
                  </Button>
                </Col>
              )
            ) : (
              <Col key={index} span={files.length < 3 ? 24 / files?.length : 8}>
                <Space
                  className={css`
                    padding: 6px;
                    border-radius: 5px;
                    border: 1px solid ${token.colorBorder};
                  `}
                >
                  <Image
                    height="100%"
                    src={`${AWS_URL}/${file.filename}`}
                    fallback="data:image/png;base64,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"
                    preview={{
                      toolbarRender: (
                        _,
                        {
                          transform: { scale },
                          actions: {
                            onFlipX,
                            onFlipY,
                            onZoomIn,
                            onZoomOut,
                            onRotateLeft,
                            onRotateRight,
                          },
                        },
                      ) => (
                        <Space size={12} className="toolbar-wrapper">
                          <DownloadOutlined onClick={() => download(file)} />
                          <SwapOutlined rotate={90} onClick={onFlipY} />
                          <SwapOutlined onClick={onFlipX} />
                          <RotateLeftOutlined onClick={onRotateLeft} />
                          <RotateRightOutlined onClick={onRotateRight} />
                          <ZoomOutOutlined
                            disabled={scale === 1}
                            onClick={onZoomOut}
                          />
                          <ZoomInOutlined
                            disabled={scale === 50}
                            onClick={onZoomIn}
                          />
                        </Space>
                      ),
                    }}
                  />
                </Space>
              </Col>
            ),
          )}
          {msg && msg?.trim() !== '' && (
            <span style={{ padding: '0 5px' }}>
              <MessageTextLine token={token} isSender={isSender} msg={msg} />
            </span>
          )}
        </Row>
      </Flex>
    </Flex>
  );
};

const MessageTextLine: FC<any> = ({ isSender, token, msg }: TextMessage) => {
  // Config
  const config: any = useConfig();

  // ligght theme
  const isLight: boolean = config?.theme === ThemeEnum.LIGHT;

  const colors: string = isSender
    ? token.colorPrimary
    : isLight
    ? '#999'
    : '#fff';

  // Return
  return (
    <Space
      className={css`
        border-radius: 5px;
        padding: 6px 12px;
        position: relative;
        border: 0.1px solid ${token.colorBorder};
        background-color: ${colors};
      `}
    >
      {isSender ? (
        <Text
          className={css`
            color: ${token.colorWhite};
          `}
        >
          {msg}
        </Text>
      ) : (
        <Text
          className={css`
            color: ${isLight ? '#000' : 'rgb(97, 97, 97)'};
          `}
        >
          {msg}
        </Text>
      )}
    </Space>
  );
};

// Message Node
const MessageNode = ({ data, justify, token, isSender }: any) => {
  // Return
  return (
    <Flex justify={justify}>
      {data?.type === MessageType.TEXT ? (
        <MessageTextLine
          token={token}
          isSender={isSender}
          msg={data?.messages}
        />
      ) : (
        <MessageFileLine
          token={token}
          isSender={isSender}
          files={data?.files}
          msg={data?.messages}
        />
      )}
    </Flex>
  );
};

const UnsendMessage: React.FC<any> = ({
  isSender,
  token,
  msg,
}: TextMessage) => {
  // Config
  const config: any = useConfig();

  // ligght theme
  const isLight: boolean = config?.theme === ThemeEnum.LIGHT;

  // Return
  return (
    <Space
      className={css`
        height: 32px;
        border-radius: 5px;
        padding: 8px 13px;
        position: relative;
        border: 0.1px solid ${token.colorBorder};
      `}
    >
      {isSender ? (
        <Text
          className={css`
            color: ${token.colorText};
          `}
        >
          {msg}
        </Text>
      ) : (
        <Text
          className={css`
            color: ${isLight ? '#000' : 'rgb(97, 97, 97)'};
          `}
        >
          {msg}
        </Text>
      )}
    </Space>
  );
};

// Check message state and render
const renderMessage = (props: any) => {
  // Check sw
  switch (props.data.state) {
    case MesssageState.RECEIVER:
      return !props.isSender ? (
        <MessageNode {...props} />
      ) : (
        <UnsendMessage
          isSender={props.isSender}
          token={props.token}
          msg="Tin nhắn đã bị xoá"
        />
      );
    case MesssageState.NONE:
      return (
        <UnsendMessage
          isSender={props.isSender}
          token={props.token}
          msg="Tin nhắn đã bị thu hồi"
        />
      );
    default:
      return <MessageNode {...props} />;
  }
};

const ChatLine: FC<Props> = ({ data, setReplyFor }: Props) => {
  // Toeken
  const { token } = useToken();

  // User
  const user: any = useAuth();

  const isSender: boolean = user.get?._id === data?.sender?.user;

  const cvsContext = useConversations();

  const [tranfModelOpen, setTranfModelOpen] = useState(false);

  // Set tranf conversation id
  const [tranfCvs, setTransfCvs] = useState<Conversations | null>(null);

  // Func pop
  const [popVisible, setPopVisible] = useState(false);

  // Show tranfrt mo
  const showTransfertMesModal = () => {
    // // Close popup
    setPopVisible(false);

    // Open modal
    setTranfModelOpen(true);
  };

  // Use message app
  const { message } = App.useApp();

  // Config
  const config: HookType<ConfigType> = useConfig();

  // Socket
  const socket: TshusSocket = useSocket();

  const handleOk = async () => {
    // Exception
    try {
      // Check socket
      if (socket && tranfCvs) {
        // Delete _id
        const { _id, ...transferMessage } = data;

        // Emit
        socket?.emit('chat.actions:server', {
          message: { ...transferMessage, conversation: tranfCvs?._id },
          action: MesssageActionEnum.TRANSFERT,
        });

        // Close modal
        setTranfModelOpen(false);
      } else {
        // Show error
        message.error('Vui lòng chọn cuộc trò chuyện muốn chuyển tiếp');
      }
    } catch (error) {
      // Show error message
      message.error('Chuyển tiếp tin nhắn không thành công');
    }
  };

  // Cancel
  const handleCancel = async () => setTranfModelOpen(false);

  // Handle transfer conversation
  const handleTranfCvs = (transf: Conversations) => setTransfCvs(transf);

  // Handle deleteMessage
  const handleDeleteMessage = async () => {
    // Exception
    try {
      // Close popup
      setPopVisible(false);

      // Check socket
      if (socket) {
        // Send socket
        socket?.emit('chat.actions:server', {
          message: data,
          action: MesssageActionEnum.DELETE,
        });
      }
    } catch (error) {
      // Show error
      message.error('Xoá tin nhắn thất bại');
    }
  };

  // Handle Unmessage
  const handleUnmessage = async () => {
    // Exception
    try {
      // Close popup
      setPopVisible(false);

      // Check socket
      if (socket) {
        // Send socket
        socket?.emit('chat.actions:server', {
          message: data,
          action: MesssageActionEnum.UNMESSAGE,
        });
      }
    } catch (error) {
      // Show error
      message.error('Thu hồi tin nhắn thất bại');
    }
  };

  // Handle Reply
  const handleReply = async () => {
    // Exception
    try {
      // Close popup
      setPopVisible(false);

      // Check socket
      setReplyFor({
        message: data,
        for:
          user.get?._id === data?.sender?.user
            ? 'Chính bạn'
            : data?.sender?.nickname,
      });
    } catch (error) {
      // Show error
      message.error('Trả lời tin nhắn tin nhắn thất bại');
    }
  };

  // Handle pin
  const handlePin = async () => {
    // Exception
    try {
      // Close popup
      setPopVisible(false);

      // Check socket
      if (socket) {
        // Pin
        socket?.emit('chat.actions:server', {
          message: data,
          action: MesssageActionEnum.PIN,
        });
      }
    } catch (error) {
      // Show error
      message.error('Ghim tin nhắn thất bại');
    }
  };

  const justify = isSender ? 'end' : 'start';

  // Avatar
  const avatar = (
    <Avatar
      size={28}
      shape="square"
      alt={data?.sender?.nickname?.charAt(0)}
      style={{ fontSize: 13 }}
      src={`${BASE_URL}/${data?.sender?.avatar}`}
    >
      {data?.sender?.nickname?.charAt(0)}
    </Avatar>
  );

  // Return
  return (
    <Row justify={justify}>
      <Col span={12}>
        <Flex align="center" style={{ padding: 10 }} justify={justify}>
          <Flex align="flex-start" gap={15}>
            <Space style={{ order: isSender ? 3 : 1 }}>{avatar}</Space>
            <Flex style={{ order: 2 }} vertical gap={4}>
              <Flex vertical align={justify} justify="center" gap={5}>
                <Flex justify={justify} align="center" gap={10} flex={1}>
                  <Text style={{ fontSize: 10, order: 2 }}>
                    {formatToTime(data?.created_at as string)}
                  </Text>
                  <Text
                    style={{ fontSize: 12.5, order: isSender ? 3 : 1 }}
                    strong
                  >
                    {data?.sender?.nickname}
                  </Text>
                </Flex>
                <Flex align="flex-start">
                  {data?.reply && (
                    <Flex style={{ position: 'relative' }}>
                      <Flex
                        gap={5}
                        justify={justify}
                        align="center"
                        className={css`
                          position: absolute;
                          top: -5px;
                          ${isSender ? 'right' : 'left'}: 0;
                          width: 300px;
                        `}
                      >
                        <ArrowBendUpLeft size={12} />
                        <Text
                          style={{
                            fontSize: 10,
                            order: 2,
                            color: token.colorTextDescription,
                          }}
                        >
                          Đã trả lời tin nhắn của {data.reply.for}
                        </Text>
                      </Flex>
                      <Button
                        style={{
                          marginTop: 15,
                        }}
                      >
                        <Flex
                          justify="start"
                          align="center"
                          style={{
                            maxWidth: 300,
                          }}
                        >
                          <Text
                            style={{
                              textOverflow: 'ellipsis',
                              maxWidth: '400px',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              fontSize: 12.5,
                              order: isSender ? 3 : 1,
                            }}
                            type="secondary"
                          >
                            {data?.reply?.messages}
                          </Text>
                        </Flex>
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
              <Flex gap={10} justify={justify}>
                {data?.state === MesssageState.BOTH ? (
                  <Popover
                    open={popVisible}
                    onOpenChange={setPopVisible}
                    placement={justify === 'end' ? 'left' : 'right'}
                    content={
                      <Flex gap={10}>
                        {isSender && (
                          <Fragment>
                            <Tooltip title="Xoá tin nhắn">
                              <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined size={20} />}
                                onClick={handleDeleteMessage}
                              />
                            </Tooltip>
                            <Tooltip title="Thu hồi tin nhắn">
                              <Button
                                type="text"
                                size="small"
                                icon={<UndoOutlined size={20} />}
                                onClick={handleUnmessage}
                              />
                            </Tooltip>
                          </Fragment>
                        )}
                        <Tooltip title="Trả lời tin nhắn">
                          <Button
                            type="text"
                            style={{
                              height: 'unset',
                              padding: '2px 3px',
                            }}
                            onClick={handleReply}
                          >
                            <Flex align="center" justify="center" gap={10}>
                              <ArrowBendUpLeft size={15} />
                            </Flex>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Ghim tin nhắn">
                          <Button
                            type="text"
                            style={{
                              height: 'unset',
                              padding: '2px 3px',
                            }}
                            onClick={handlePin}
                          >
                            <Flex align="center" justify="center" gap={10}>
                              <PushPin size={15} />
                            </Flex>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Chuyển tiếp tin nhắn">
                          <Button
                            type="text"
                            size="small"
                            icon={<ForwardOutlined size={20} />}
                            onClick={showTransfertMesModal}
                          />
                        </Tooltip>
                      </Flex>
                    }
                    trigger="contextMenu"
                  >
                    <Fragment>
                      {renderMessage({ data, justify, token, isSender })}
                    </Fragment>
                  </Popover>
                ) : (
                  <Fragment>
                    {renderMessage({ data, justify, token, isSender })}
                  </Fragment>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Col>
      <Modal
        open={tranfModelOpen}
        title="Chuyển tiếp tin nhắn"
        onCancel={handleCancel}
        zIndex={1030}
        footer={null}
      >
        <Flex vertical gap={20}>
          <Radio.Group style={{ width: '100%' }} value={tranfCvs?._id}>
            {cvsContext?.list.get?.length > 1 ? (
              cvsContext?.list.get?.map((item: Conversations) => {
                // Check not current cvs
                if (item?._id !== data?.conversation) {
                  // Is Rooms
                  const isRooms = item?.type === ConversationEnum.ROOMS;

                  const chats = item?.chats?.[0];

                  const isInviter = user.get?._id === chats?.inviter?.user;

                  const cvsName = isRooms
                    ? item?.rooms[0]?.name
                    : isInviter
                    ? chats?.friend?.nickname
                    : chats?.inviter?.nickname;

                  // Return
                  return (
                    <Flex
                      key={item._id}
                      justify="space-between"
                      style={{ borderRadius: 5 }}
                      className={`${
                        config.get.theme === ThemeEnum.DARK
                          ? 'cvs-d-hover'
                          : 'cvs-l-hover'
                      } ${
                        item._id === tranfCvs?._id &&
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
                        onClick={() => handleTranfCvs(item)}
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
                            {cvsName?.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Flex gap={1} vertical justify="space-between">
                          <Text style={{ fontSize: 13 }}>{cvsName}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item?.last_message || 'Không có tin nhắn nào'}
                          </Text>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Radio value={item?._id} />
                      </Flex>
                    </Flex>
                  );
                }
              })
            ) : (
              <EmptyHorizontal desc="Không có dữ liệu" />
            )}
          </Radio.Group>
          <Flex>
            <Button
              type="primary"
              onClick={handleOk}
              style={{
                width: '100%',
              }}
            >
              Chuyển tiếp tin nhắn
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </Row>
  );
};

export default ChatLine;
