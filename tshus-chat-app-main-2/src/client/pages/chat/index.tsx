import {
  Button,
  Col,
  Flex,
  Row,
  theme,
  UploadFile,
  Tooltip,
  GetProp,
  UploadProps,
  Skeleton,
  Badge,
  Avatar,
  Typography,
  Drawer,
  Divider,
  Collapse,
  App,
  Popover,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {
  ArrowBendUpLeft,
  Calendar,
  Chats,
  DotsThree,
  ImageSquare,
  Link,
  Microphone,
  PaperPlaneRight,
  Phone,
  User as UserIcon,
  WechatLogo,
  X,
} from '@phosphor-icons/react';
import EmojiPick from '@/client/components/emoji';
import ConversationsProvider from '@/client/context/conversations-context';
import { useConversations } from '@/client/hooks/user-conversations';
import { useSocket } from '@/common/hooks/use-socket';
import { useAuth } from '@/client/hooks/use-auth';
import ChatSide from './components/chat-layout/side';
import ChatUploadFile from './components/chat-upload/upload-file';
import ChatUploadImage from './components/chat-upload/upload-image';
import { MessageType } from '@/common/enum/message-type';
import { Response } from '@/common/types/response/response.type';
import { BASE_URL, fetcher } from '@/common/utils/fetcher';
import ChatContent from './components/chat-layout/content';
import EmptyVertical from '@/client/components/empty/vertical.empty';
import { Messages } from '@/common/interface/Messages';
import {
  FC,
  FormEvent,
  Fragment,
  memo,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ConversationEnum } from '@/common/enum/conversation.enum';
import { Conversations } from '@/common/interface/Conversations';
import { formatToDateTime } from '@/common/utils/date';
import { ThemeEnum } from '@/common/enum/theme.enum';
import { useConfig } from '@/common/hooks/use-config';
import AddMemberToGroupModal from '@/client/components/modals/member/add';
import DeleteMemberFromGroupModal from '@/client/components/modals/member/delete';
import { Roommembers } from '@/common/interface/Roommembers';
import { ConversationType } from '@/common/types/conversation/cvs.type';
import { AuthHookType, HookType } from '@/common/types/other/hook.type';
import { User } from '@/common/interface/User';
import { ConfigType } from '@/common/types/other/config.type';
import { ChaterType } from '@/common/types/user/chater.type';
import { Rooms } from '@/common/interface/Rooms';
import { useCall } from '@/common/hooks/use-call';
import { SocketProps, TshusSocket } from '@/common/types/other/socket.type';
import { useOnline } from '@/common/hooks/use-online';
import { isOnline } from '@/common/utils/ultils';
import { RoommembersEnum } from '@/common/enum/roommember-role.enum';
import { MesssageState } from '@/common/enum/message-state.enum';
import { MesssageActionEnum } from '@/common/enum/user/message-actions.enum';
import { MessageReplyType } from '@/common/types/messages/message.reply.type';

const { Text, Title } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const ChatWrapper: FC = () => {
  // Return
  return (
    <ConversationsProvider>
      <Chat />
    </ConversationsProvider>
  );
};

// Use Token
const { useToken } = theme;

type ContentViewHeadProps = {
  isRoom: boolean;
  data: any;
  onlines: any;
};

// Contenview Header
const ContentViewHead: FC<ContentViewHeadProps> = memo(
  ({ data, isRoom, onlines }: ContentViewHeadProps) => {
    // Return
    return (
      <Flex align="center" gap={15} vertical>
        <Avatar
          shape="square"
          style={{ width: '100%', height: 200, fontSize: 50 }}
          alt={
            isRoom
              ? (data as Rooms)?.name?.charAt(0)
              : (data as ChaterType)?.nickname?.charAt(0)
          }
          src={
            isRoom
              ? `${BASE_URL}/${(data as Rooms)?.image}`
              : `${BASE_URL}/${(data as ChaterType)?.avatar}`
          }
        >
          {isRoom
            ? (data as Rooms)?.name?.charAt(0)
            : (data as ChaterType)?.nickname?.charAt(0)}
        </Avatar>
        <Flex gap={1} vertical align="center">
          <Text style={{ fontSize: 23 }}>
            {isRoom ? (data as Rooms)?.name : (data as ChaterType)?.nickname}
          </Text>
          <Flex align="center" gap={5}>
            {isOnline(onlines, isRoom, data) ? (
              <Fragment>
                <Badge dot status="success" />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Đang hoạt động
                </Text>
              </Fragment>
            ) : (
              <Fragment>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Hiện đang ngoại tuyến
                </Text>
              </Fragment>
            )}
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

// Render message
const renderToastMessage = (key: MesssageActionEnum) => {
  switch (key) {
    case MesssageActionEnum.TRANSFERT:
      return 'Chuyển tiếp tin nhắn thành công';
    case MesssageActionEnum.DELETE:
      return 'Xoá tin nhắn thành công';
    case MesssageActionEnum.UNMESSAGE:
      return 'Thu hồi tin nhắn thành công';
    case MesssageActionEnum.PIN:
      return 'Ghim tin nhắn thành công';
  }
};

const Chat: FC = () => {
  // Toeken
  const { token } = useToken();

  // call
  const call = useCall();

  const delay: number = 300;

  // Message State
  const [inputMessage, setInputMessage] = useState<string>('');

  // Roommembers State
  const [roommembers, setRoommembers] = useState<Roommembers[] | []>([]);

  // Chat messages
  const [messages, setMessages] = useState<Messages[]>([]);

  const [currCvsLoading, setCurrCsvLoading] = useState<boolean>(true);

  // Replpy
  const [replyFor, setReplyFor] = useState<MessageReplyType | null>(null);

  // Use message app
  const { message } = App.useApp();

  // Onlines
  const onlines: SocketProps[] = useOnline();

  // File list
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // File list
  const [imageList, setImageList] = useState<UploadFile[]>([]);

  // Open Drawer
  const [open, setOpen] = useState<boolean>(false);

  // Config
  const config: HookType<ConfigType> = useConfig();

  // Calling handle
  const callingHandle = (to: string) => {
    setOpen(false);
    call?.calling(to);
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // Upload file btn ref
  const uploadFileBtn: RefObject<HTMLButtonElement> =
    useRef<HTMLButtonElement>(null);

  // Upload file image ref
  const uploadImageBtn: RefObject<HTMLButtonElement> =
    useRef<HTMLButtonElement>(null);

  // Socket
  const socket: TshusSocket = useSocket();

  // Conversations
  const cvsContext: ConversationType = useConversations();

  // User
  const user: AuthHookType<User> = useAuth();

  // Handle Set Message
  const handleSetMessage: any = (value: string) => setInputMessage(value);

  // get cursor position and add the emoji to message string
  const handleEmojiPickup = (emoji: any) => {
    setInputMessage((prev) => prev + emoji.native);
  };

  // Send messages to server
  const onSubmit = async (e: FormEvent): Promise<void> => {
    // Event prevent
    e.preventDefault();

    // Handle Messages
    const promise = async (): Promise<any> => {
      // Handle promise
      return new Promise(async (resolve, reject) => {
        // Temp User data
        const temp: User = user.get;

        // Check has file
        const hasFile: boolean = fileList.length > 0 || imageList.length > 0;

        // Check message valid
        const isValid: boolean =
          Boolean(inputMessage) && inputMessage.trim() !== '';

        // Create message info
        const info: Messages = {
          files: [],
          sender: {
            user: temp?._id,
            avatar: temp?.avatar,
            nickname: temp?.nickname,
          },
          reply: replyFor
            ? {
                ...replyFor.message,
                for: replyFor.for,
              }
            : null,
          send_at: new Date(),
          state: MesssageState.BOTH,
          messages: inputMessage.trim(),
          conversation: cvsContext.current.get?._id,
          type: hasFile ? MessageType.FILES : MessageType.TEXT,
        };

        // Has file
        if (hasFile) {
          // Each and add file to form data
          const formData: FormData = new FormData();

          // Add files
          [...fileList, ...imageList]?.forEach((file: UploadFile) => {
            // File original
            const orf = file?.originFileObj as FileType;

            // Append
            formData.append('files[]', orf);
          });

          // Clear file list
          setFileList([]);

          // Clear image list
          setImageList([]);

          // Upload Image
          const uploaded: Response = await fetcher({
            method: 'UPLOAD',
            url: '/messages/upload',
            payload: formData,
          });

          // Check is uploaed success
          if (uploaded?.status === 201) {
            // Push files name
            info.files = uploaded.data;
          }

          // Resolve Data
          resolve(info);
        } else if (isValid) {
          // Resolve Data
          resolve(info);
        }

        // Clear message
        setInputMessage('');

        // Resject
        reject();
      });
    };

    // Handle messages promise
    promise()
      .then((res) => {
        // Send Message
        socket.emit('chat:server', res);

        // Clear reply
        setReplyFor(null);
      })
      .catch(() => {});
  };

  // First Loading Use Effect
  useEffect(() => {
    // Check socket connected
    if (socket) {
      // Subscribes events
      socket?.on('chat:client', async (mes: Messages) => {
        // Find conversation
        const find = cvsContext.list.get?.find(
          (item) => item._id === mes.conversation,
        );

        // Check find
        if (find) {
          // Destructure
          const { last_message, ...data }: Messages = mes;

          // Updated conversation
          const updated = {
            ...find,
            last_message,
            last_send: data.send_at,
          };

          // Check conversation
          if (mes?.conversation === cvsContext.current.get?._id) {
            // Set current conversation
            await cvsContext.current.update(updated);

            // Set message
            setMessages((prev) => [data, ...prev]);
          } else {
            // Set current conversation
            await cvsContext.list.update(updated);
          }
        }
      });

      // Chat actions client
      socket?.on('chat.actions:client', async (client: any) => {
        // Client message
        const mes = client?.message;

        // Check finder
        if (user.get?._id === mes?.sender?.user) {
          // Check and show message
          message.success(renderToastMessage(client?.action));
        }

        // Check conversation
        if (mes?.conversation === cvsContext.current.get?._id) {
          // Check is not tranfert
          if (client?.action === MesssageActionEnum.TRANSFERT) {
            // Update conversation last message
            cvsContext.current.update({
              conversation: client.message.conversation,
              last_message: client.message.last_message,
              last_send: client.message.send_at,
            });

            // Push message
            setMessages((prev) => [client?.message, ...prev]);
          } else if (client?.action === MesssageActionEnum.PIN) {
            // Update conversation last message
            cvsContext.current.update({
              conversation: mes.conversation,
              pins: [
                ...(cvsContext.current.get?.pins as Messages[]),
                mes,
              ],
            });
          } else {
            // Set message
            setMessages((prev) => {
              // Filter message
              const newMessages = prev
                ?.map((mesa) => {
                  // Check message
                  if (mesa?._id === mes?._id) {
                    // Updated message
                    return {
                      ...mesa,
                      state: mes.state,
                    };
                  }

                  // Return
                  return mesa;
                })
                ?.filter((mesa) => mesa !== null) as Messages[];

              // Rreturn
              return newMessages;
            });
          }
        }
      });
    }

    // Cleanup
    return () => {
      socket?.off('chat:client');
      socket?.off('chat.actions:client');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvsContext.current.get, socket]);

  // Use Effect
  useEffect(() => {
    // Load roommembers
    cvsContext.current.get?.type === ConversationEnum.ROOMS &&
      (async () => {
        // Response
        const res: Response = await fetcher({
          method: 'GET',
          url: '/roommembers/page',
          payload: { room: cvsContext.current.get?.rooms?.[0]?._id, page: 1 },
        });

        // If response success
        if (res?.status === 200) {
          // Set members
          setRoommembers(res?.data);
        }
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvsContext.current.get?.type]);

  // Effect
  useEffect(() => {
    // List conversation length
    const listCvsLength: number = cvsContext.list.get?.length as number;

    // Loading current conversation
    listCvsLength > 0 &&
      !cvsContext.current.get &&
      (async () => {
        // Load data to session storage
        const sessionCvs = sessionStorage.getItem('tshus.curent.conversation');

        // Parse data
        const parse = sessionCvs ? JSON.parse(sessionCvs) : null;

        // Handle set current cvs
        const setCurrentCvs = cvsContext.current.set;

        // Check session has conversation
        if (parse?.user_id === user.get?._id && parse?.cvs) {
          // Set default current conversation
          setCurrentCvs(parse.cvs);
        } else {
          // Set default current conversation
          setCurrentCvs(cvsContext.list.get?.[0]);
        }

        // Enable loading
        setCurrCsvLoading(true);
      })();

    // Disable Loadign
    setTimeout(() => {
      setCurrCsvLoading(false);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvsContext.list.get]);

  // Use Effect
  useEffect(() => {
    // Current conversation id
    const cvsId: string = cvsContext.current.get?._id as string;

    // Caling
    cvsId &&
      (async () => {
        // Get messages
        const res: Response = await fetcher({
          method: 'GET',
          url: '/messages/page',
          payload: { conversation: cvsId, page: 1 },
        });

        // Check status
        if (res?.status === 200) setMessages(res?.data);
      })();

    // Return clean
    return () => {
      // Clean message
      setMessages([]);

      // Clean file list
      setFileList([]);

      // Clean image list
      setImageList([]);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvsContext.current.get?._id]);

  const DrawerContent = (cvs: Conversations) => {
    // Is room
    const isRoom: boolean = cvs?.type === ConversationEnum.ROOMS;

    // Data
    const data: ChaterType | Rooms = isRoom
      ? cvs?.rooms?.[0]
      : cvs?.chats?.[0]?.[
          `${
            user.get?._id === cvs?.chats?.[0]?.inviter?.user
              ? 'friend'
              : 'inviter'
          }`
        ];

    // Return
    return (
      <Flex
        vertical
        style={{ height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}
      >
        <ContentViewHead isRoom={isRoom} data={data} onlines={onlines} />
        <Divider plain orientationMargin="0" dashed />
        {isRoom && (data as Rooms)?.roommembers?.length > 0 ? (
          <Flex justify="center" gap={15}>
            {(data as Rooms)?.roommembers?.[0]?.user === user.get?._id &&
              (data as Rooms)?.roommembers?.[0]?.role ===
                RoommembersEnum.MANAGER && (
                <Fragment>
                  <AddMemberToGroupModal />
                  <DeleteMemberFromGroupModal roommembers={roommembers} />
                </Fragment>
              )}
            <Button style={{ height: 'unset', padding: '5px' }}>
              <Flex align="center">
                <DotsThree size={20} />
              </Flex>
            </Button>
          </Flex>
        ) : (
          <Flex justify="center" gap={10}>
            {!isRoom && (
              <Button
                style={{ height: 'unset', padding: '5px' }}
                onClick={() => callingHandle((data as ChaterType)?.user)}
              >
                <Flex align="center">
                  <Phone size={20} />
                </Flex>
              </Button>
            )}
            <Button style={{ height: 'unset', padding: '5px' }}>
              <Flex align="center">
                <DotsThree size={20} />
              </Flex>
            </Button>
          </Flex>
        )}
        <Divider plain orientationMargin="0" dashed />
        <Collapse defaultActiveKey={['1']}>
          <Collapse.Panel key={'1'} header="THÔNG TIN">
            <Flex align="left" gap={15} vertical>
              <Flex vertical gap={10}>
                <Flex align="center" gap={15}>
                  <UserIcon
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Tên:{' '}
                    {isRoom
                      ? (data as Rooms)?.name
                      : (data as ChaterType)?.nickname}
                  </Text>
                </Flex>
                <Flex align="center" gap={15}>
                  <WechatLogo
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Nhắn tin: {isRoom ? 'Phòng chat' : 'Chat riêng'}
                  </Text>
                </Flex>
                <Flex align="center" gap={15}>
                  <Calendar
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Ngày tạo: {formatToDateTime(cvs?.created_at?.toString())}
                  </Text>
                </Flex>
                {isRoom && (
                  <Fragment>
                    <Flex align="center" gap={15}>
                      <Calendar
                        size={18}
                        style={{ color: token.colorTextDescription }}
                      />
                      <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                        Số lượng thành viên: {(data as Rooms)?.members_count}{' '}
                        thành viên
                      </Text>
                    </Flex>
                  </Fragment>
                )}
                <Flex align="center" gap={15}>
                  <Calendar
                    size={18}
                    style={{ color: token.colorTextDescription }}
                  />
                  <Text style={{ fontSize: 13.5, fontWeight: '400' }}>
                    Tin nhắn mới nhất:{' '}
                    {formatToDateTime(cvs?.last_send?.toString())}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Collapse.Panel>
        </Collapse>
        <Divider plain orientationMargin="0" dashed />
        {isRoom && roommembers?.length > 0 && (
          <Collapse defaultActiveKey={['2']}>
            <Collapse.Panel key={'2'} header="THÀNH VIÊN NHÓM">
              <Flex align="left" gap={5} vertical>
                {roommembers?.map((member: any) => (
                  <Flex
                    key={member._id}
                    justify="space-between"
                    style={{ cursor: 'pointer', padding: 2, borderRadius: 5 }}
                    className={`${
                      config.get.theme === ThemeEnum.DARK
                        ? 'cvs-d-hover'
                        : 'cvs-l-hover'
                    }`}
                    align="center"
                  >
                    <Flex align="center" gap={15}>
                      <Avatar
                        shape="square"
                        alt={member?.nickname?.charAt(0)}
                        size={35}
                      >
                        {member?.nickname?.charAt(0)}
                      </Avatar>
                      <Flex gap={1} vertical justify="space-between">
                        <Text style={{ fontSize: 14 }}>{member?.nickname}</Text>
                      </Flex>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Collapse.Panel>
          </Collapse>
        )}
      </Flex>
    );
  };

  const ContentView = (cvs: Conversations) => {
    // Check is room
    const isRoom: boolean = cvs?.type === ConversationEnum.ROOMS;

    // Conversation Data
    const data: any = isRoom
      ? cvs?.rooms?.[0]
      : cvs?.chats?.[0]?.[
          `${
            user.get?._id === cvs?.chats?.[0]?.inviter?.user
              ? 'friend'
              : 'inviter'
          }`
        ];

    // Conversation Name
    const cvsName = isRoom ? data?.name : data?.nickname;

    // Return
    return currCvsLoading === true || (currCvsLoading === false && cvs) ? (
      <Flex vertical style={{ height: '100%' }}>
        <Flex
          style={{
            position: 'relative',
            padding: '17px',
            backgroundColor: token.colorBgBase,
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <Flex align="center" justify="space-between" flex={1}>
            <Flex align="center" gap={15}>
              {!currCvsLoading ? (
                <Fragment>
                  {isOnline(onlines, isRoom, data) ? (
                    <Fragment>
                      <Badge
                        dot
                        style={{
                          padding: 3.5,
                          backgroundColor: token.colorSuccess,
                        }}
                        status="processing"
                        offset={[-1, '100%']}
                      >
                        <Avatar shape="square" alt={'1'} size={35}>
                          {cvsName?.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Flex gap={1} vertical justify="space-between">
                        <Text style={{ fontSize: 13 }}>{cvsName}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Đang hoạt động
                        </Text>
                      </Flex>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Avatar shape="square" alt={'1'} size={35}>
                        {cvsName?.charAt(0)}
                      </Avatar>
                      <Flex gap={1} vertical justify="space-between">
                        <Text style={{ fontSize: 13 }}>{cvsName}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Hiện đang ngoại tuyến
                        </Text>
                      </Flex>
                    </Fragment>
                  )}
                </Fragment>
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
            <Flex gap={20}>
              {!isRoom && (
                <Button
                  onClick={() => callingHandle(!isRoom ? data : null)}
                  style={{ height: 'unset', padding: '5px' }}
                >
                  <Flex align="center">
                    <Phone size={20} />
                  </Flex>
                </Button>
              )}
              <Button
                onClick={showDrawer}
                style={{ height: 'unset', padding: '5px' }}
              >
                <Flex align="center">
                  <DotsThree size={20} />
                </Flex>
              </Button>
            </Flex>
          </Flex>
          {cvs?.pins?.length > 0 && (
            <Flex
              gap={10}
              align="center"
              style={{
                left: 0,
                right: 0,
                zIndex: 1,
                width: '100%',
                height: '60%',
                bottom: '-60%',
                position: 'absolute',
                backgroundColor: token.colorBgBase,
                border: `1px solid ${token.colorBorder}`,
                borderLeft: 0,
                padding: '0 20px',
              }}
            >
              <Chats size={25} />
              <Flex vertical style={{ maxWidth: '90%' }}>
                <Title style={{ fontSize: 12, margin: 0 }}>
                  Tin nhắn đã ghim
                </Title>
                <Text
                  style={{
                    fontSize: 12,
                    color: token.colorTextDescription,
                    textOverflow: 'ellipsis',
                    maxWidth: '90%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cvs?.pins?.[0]?.type === MessageType.TEXT ? (
                    cvs?.pins?.[0]?.messages
                  ) : 'Một tin nhắn kèm tệp tin đã được ghim!'}
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>
        <ChatContent
          mes={messages}
          cvsId={cvs?._id}
          setMes={setMessages}
          setReplyFor={setReplyFor}
        />
        <Flex
          style={{
            padding: '20px 20px 10px 20px',
            background: token.colorBgBase,
            borderTop: `1px solid ${token.colorBorder}`,
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Flex gap={13}>
            <Flex flex={1} gap={4}>
              <Flex align="end" justify="center">
                <ChatUploadFile
                  fileList={fileList}
                  setFileList={setFileList}
                  uploadBtn={uploadFileBtn}
                />
                <ChatUploadImage
                  imageList={imageList}
                  setImageList={setImageList}
                  uploadBtn={uploadImageBtn}
                />
              </Flex>
              <Popover
                open={Boolean(replyFor)}
                placement="topLeft"
                overlayInnerStyle={{ width: '100%' }}
                content={
                  <Tooltip title={replyFor?.message?.messages}>
                    <Flex
                      style={{
                        maxWidth: '400px',
                      }}
                    >
                      <Text
                        style={{
                          textOverflow: 'ellipsis',
                          maxWidth: '400px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {replyFor?.message?.messages}
                      </Text>
                    </Flex>
                  </Tooltip>
                }
                title={
                  <Flex justify="space-between" align="center" gap={20}>
                    <Flex align="center" gap={10}>
                      <ArrowBendUpLeft size={15} />
                      <Flex align="center" gap={5}>
                        <Text style={{ fontSize: 13, fontWeight: 400 }}>
                          Đang trả lời cho
                        </Text>
                        <Text style={{ fontSize: 13 }}>{replyFor?.for}</Text>
                      </Flex>
                    </Flex>
                    <Button
                      type="text"
                      style={{
                        height: 'unset',
                        padding: '2px',
                      }}
                      onClick={() => setReplyFor(null)}
                    >
                      <Flex align="center" justify="center" gap={10}>
                        <X size={15} />
                      </Flex>
                    </Button>
                  </Flex>
                }
              >
                <Flex flex={1}>
                  <TextArea
                    variant="filled"
                    onPressEnter={(e) => !e.shiftKey && onSubmit(e)}
                    placeholder="Nhập nội dung tin nhắn"
                    autoSize
                    value={inputMessage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onChange={(e) => handleSetMessage(e.target.value)}
                  />
                </Flex>
              </Popover>
            </Flex>
            <Flex align="flex-end" gap={10}>
              <EmojiPick onSelect={handleEmojiPickup} />
              <Button
                icon={<PaperPlaneRight size={20} />}
                type="primary"
                onClick={onSubmit}
              />
            </Flex>
          </Flex>
          <Flex>
            <Tooltip title="Gửi tin nhắn thoại" placement="topLeft">
              <Button
                icon={<Microphone size={20} />}
                type="text"
                style={{ color: token.colorTextSecondary }}
              />
            </Tooltip>
            <Tooltip title="Tải tệp lên" placement="topLeft">
              <Button
                icon={<Link size={20} />}
                type="text"
                onClick={() => uploadFileBtn?.current?.click()}
                style={{ color: token.colorTextSecondary }}
              />
            </Tooltip>
            <Tooltip title="Tải hình ảnh lên" placement="topLeft">
              <Button
                icon={<ImageSquare size={20} />}
                type="text"
                onClick={() => uploadImageBtn?.current?.click()}
                style={{ color: token.colorTextSecondary }}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
    ) : (
      <Flex justify="center" align="center" className="h-100">
        <EmptyVertical desc="Không có dữ liệu" />
      </Flex>
    );
  };

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
          <ChatSide token={token} cvsContext={cvsContext} user={user} />
        </Col>
        <Col xl={19} lg={18} md={16} sm={0} xs={0} className="h-100">
          {ContentView(cvsContext.current.get as Conversations)}
        </Col>
      </Row>
      <Drawer title="Thông tin cuộc trò chuyện" onClose={onClose} open={open}>
        {DrawerContent(cvsContext.current.get as Conversations)}
      </Drawer>
    </Fragment>
  );
};

export default ChatWrapper;
