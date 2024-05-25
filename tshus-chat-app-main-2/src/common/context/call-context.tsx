import { Phone, PhoneDisconnect } from '@phosphor-icons/react';
import { Avatar, Button, Flex, Modal, theme, Typography } from 'antd';
import {
  createContext,
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AuthHookType } from '../types/other/hook.type';
import { User } from '../interface/User';
import { useAuth } from '@/client/hooks/use-auth';
import { BASE_URL } from '../utils/fetcher';
import { TshusSocket } from '../types/other/socket.type';
import { useSocket } from '../hooks/use-socket';
import Peer from 'simple-peer';
import { ChaterType } from '../types/user/chater.type';

const { Text } = Typography;

type Props = {
  children: ReactNode;
};

type CallerType = {
  from: string;
  name: string;
};

export const CallContext = createContext<any>(undefined);

const CallProvider = ({ children }: Props) => {
  // Call State
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);

  const { token } = theme.useToken();

  // Auth
  const auth: AuthHookType<User> = useAuth();

  // Socket
  const socket: TshusSocket = useSocket();

  // Stream
  const [stream, setStream] = useState<any>(null);

  // caller
  const [caller, setCaller] = useState<CallerType | null>(null);

  // Call to
  const [callTo, setCallTo] = useState<ChaterType | null>(null);

  // receivingCall
  const [receivingCall, setReceivingCall] = useState<any>(null);

  // Is Video on
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);

  // Call accepted
  const [callAccepted, setCallAccepted] = useState<boolean>(false);

  // Call signal
  const [callerSignal, setCallerSignal] = useState<any>();

  // Call Ended
  const [callEnded, setCallEnded] = useState<boolean>(false);

  // User video
  const userVideo: any = useRef();

  // Connection ref
  const connectionRef: any = useRef();

  // Stop stracks
  const stopTracks = async () => {
    // Stop
    await stream?.getTracks().forEach((track: any) => {
      track.stop();
    });

    // Remove stream
    setStream(null);

    // Remove stream
    setCallerSignal(null);

    // Clear user video
    if (userVideo?.current?.srcObject) {
      userVideo.current.srcObject = null;
    }
  };

  const answerCall = async () => {
    // Accepted calling
    setCallAccepted(true);

    // Create temp stream
    const tempStream: any = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Peer
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: tempStream,
    });

    // On signal
    peer.on('signal', (data: any) => {
      // Emit
      socket.emit('call:answer', { signal: data, to: caller?.from });
    });

    // On stream
    peer.on('stream', (stream: any) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);

    // Set connection ref
    connectionRef.current = peer;
  };

  // Calling
  const calling = async (userToCall: ChaterType) => {
    // Navigator
    const tempStream: any = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(tempStream);

    // Set call
    setCallTo(userToCall);

    // Set open modal
    setCallModalOpen(true);

    // Check userToCall
    if (userToCall) {
      // Peer
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: tempStream,
      });

      // Call signal
      peer.on('signal', (data: any) => {
        socket.emit('call:to', {
          to: userToCall,
          signalData: data,
          from: auth?.get?._id,
          name: auth.get?.nickname,
        });
      });

      // Call accepted
      socket.on('call:accepted', (signal) => {
        // Enalbe call accept
        setCallAccepted(true);

        // Signal
        peer.signal(signal);
      });

      peer.on('stream', (stream: any) => {
        userVideo.current.srcObject = stream;
      });

      connectionRef.current = peer;
    }
  };

  const leaveCall = () => {
    // Emit sending call
    socket?.emit('call:to:end', {
      from: auth?.get?._id,
      name: auth.get?.nickname,
      to: auth?.get?._id === caller?.from ? caller?.from : callTo?.user,
    });

    // Stop
    stopTracks();

    // Clear call to
    setCallTo(null);

    // Set call end
    setCallEnded(true);

    // Close open
    setCallModalOpen(false);
  };

  // Shard data
  const shared: any = {
    calling,
  };

  // Calling Effect
  useEffect(() => {
    (async () => {
      if (socket) {
        // Event Call
        socket?.on('call:from', (data: any) => {
          // Disable call
          setCallModalOpen(true);

          // Disable call
          setReceivingCall(true);

          // Set caller signal
          setCallerSignal(data?.signal);

          // Set caller
          setCaller({
            from: data?.from,
            name: data?.name,
          });
        });

        // Event
        socket?.on('call:from:end', () => {
          // Sctop
          stopTracks();

          // Disable call
          setCallModalOpen(false);

          // Set caller
          setCaller(null);

          // Set call to
          setCallTo(null);
        });
      }
    })();

    // Clean up
    return () => {
      // Off events call:from
      socket?.off('call:from');

      // Off events
      socket?.off('call:from:end');

      // Destroy
      if (connectionRef?.current) {
        connectionRef?.current?.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Return
  return (
    <CallContext.Provider value={shared}>
      <Fragment>
        <Modal
          width={callAccepted ? 400 : 300}
          open={callModalOpen}
          closeIcon={null}
          footer={null}
        >
          {callAccepted && !callEnded ? (
            <Flex vertical gap={10}>
              <Text style={{ fontSize: 18 }}>{receivingCall ? caller?.name : callTo?.nickname}</Text>
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: '100%', height: '100%', borderRadius: 10}}
              />
              <Button
                danger
                type="primary"
                onClick={leaveCall}
                style={{
                  width: '100%',
                  height: 'unset',
                  padding: '5px 10px',
                }}
              >
                <Flex align="center" justify="center" gap={10}>
                  <PhoneDisconnect size={20} weight="fill" />
                  <Text style={{ fontSize: 14, color: 'white' }}>Huỷ gọi</Text>
                </Flex>
              </Button>
            </Flex>
          ) : !callTo ? (
            <Flex vertical gap={15}>
              <Flex justify="center">
                <Avatar
                  shape="square"
                  alt={auth.get?.nickname?.charAt(0)}
                  size={60}
                  src={`${BASE_URL}/${auth.get?.avatar}`}
                >
                  {auth.get?.nickname?.charAt(0)}
                </Avatar>
              </Flex>
              <Flex justify="center" vertical align="center">
                <Typography.Text style={{ fontSize: 18 }}>
                  {caller?.name}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 15, color: token.colorTextSecondary }}
                >
                  đang gọi cho bạn
                </Typography.Text>
              </Flex>
              <Flex gap={20}>
                <Button
                  type="primary"
                  onClick={answerCall}
                  style={{
                    width: '100%',
                    height: 'unset',
                    padding: '5px 10px',
                  }}
                >
                  <Flex align="center" justify="center" gap={10}>
                    <Phone size={20} weight="fill" />
                    <Text style={{ fontSize: 14, color: 'white' }}>Nghe</Text>
                  </Flex>
                </Button>
                <Button
                  danger
                  type="primary"
                  onClick={leaveCall}
                  style={{
                    width: '100%',
                    height: 'unset',
                    padding: '5px 10px',
                  }}
                >
                  <Flex align="center" justify="center" gap={10}>
                    <PhoneDisconnect size={20} weight="fill" />
                    <Text style={{ fontSize: 14, color: 'white' }}>
                      Từ chối
                    </Text>
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex vertical gap={15}>
              <Flex justify="center">
                <Avatar
                  shape="square"
                  alt={callTo?.nickname?.charAt(0)}
                  size={60}
                  src={`${BASE_URL}/${callTo?.avatar}`}
                >
                  {callTo?.nickname?.charAt(0)}
                </Avatar>
              </Flex>
              <Flex justify="center" vertical align="center">
                <Typography.Text style={{ fontSize: 18 }}>
                  {callTo?.nickname}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 15, color: token.colorTextSecondary }}
                >
                  đang liên hệ
                </Typography.Text>
              </Flex>
              <Button
                danger
                type="primary"
                onClick={leaveCall}
                style={{
                  width: '100%',
                  height: 'unset',
                  padding: '5px 10px',
                }}
              >
                <Flex align="center" justify="center" gap={10}>
                  <PhoneDisconnect size={20} weight="fill" />
                  <Text style={{ fontSize: 14, color: 'white' }}>Huỷ gọi</Text>
                </Flex>
              </Button>
            </Flex>
          )}
        </Modal>
      </Fragment>
      {children}
    </CallContext.Provider>
  );
};

export default CallProvider;
