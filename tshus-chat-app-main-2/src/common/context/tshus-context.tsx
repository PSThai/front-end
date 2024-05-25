import { createContext, FC, ReactNode, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ThemeEnum } from '../enum/theme.enum';
import { ConfigType } from '../types/other/config.type';
import { SocketProps } from '../types/other/socket.type';

export const TshusContext = createContext<any>(undefined);

interface Props {
  children: ReactNode;
}

const TshusProvider: FC<Props> = ({ children }: Props) => {
  // Config
  const [config, setConfig] = useState<ConfigType>(() => {
    // Default Config
    const defaultConfig = { theme: ThemeEnum.LIGHT };

    // Get config
    const data: string | null = localStorage.getItem('config');

    // Check and set config to local storage
    !data && localStorage.setItem('config', JSON.stringify(defaultConfig));

    // Return
    return data ? JSON.parse(data) : defaultConfig;
  });

  // Users onlines
  const [onlines, setOnlines] = useState<SocketProps[]>([]);

  // Stomp client state
  const [socket, setSocket] = useState<any | null>(null);

  // Handle set config
  const handleSetConfig: Function = (key: string, value: any) => {
    // New Config
    const newConfig: ConfigType = { ...config, [key]: value };

    // Set config
    setConfig(newConfig);

    // Set config to local storage
    localStorage.setItem('config', JSON.stringify(newConfig));
  };

  // Use Effect
  useEffect(() => {
    // Calling connecting
    const socket: any = io(`http://localhost:2820`, {
      autoConnect: false,
    });

    socket?.on('users', (users: SocketProps[]) => {
      // Map online
      const mapOnlines = users?.filter((u: SocketProps) => u?.user !== socket?.auth?.user);

      // Set onlines
      setOnlines(mapOnlines);
    })

    // Set Client
    setSocket(socket);

    // Return clean
    return () => {
      // Disconnect Socket
      socket.disconnect();

      // Clean
      setSocket(null);

      // Clean onlines
      setOnlines([]);
    };
  }, []);

  // Shared Data
  const sharedData: any = {
    config: {
      get: config,
      set: handleSetConfig,
    },
    socket: { get: socket },
    online: onlines
  };

  // Return
  return (
    <TshusContext.Provider value={sharedData}>{children}</TshusContext.Provider>
  );
};

export default TshusProvider;
