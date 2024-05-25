import { FC, ReactNode, useContext } from 'react';
import { TshusContext } from './tshus-context';
import AuthProvider from '../../client/context/auth/context';
import { App, ConfigProvider } from 'antd';
import { colors, components } from '../utils/colors';
import { ThemeEnum } from '@/common/enum/theme.enum';

interface Props {
  children: ReactNode;
}

const ThemeContext: FC<Props> = ({ children }: Props) => {
  // Tshus Context theme
  const tshusTheme: ThemeEnum = useContext<any>(TshusContext)?.config?.get?.theme;

  // Return
  return (
    <ConfigProvider
      theme={{
        token: colors(tshusTheme),
        components: components(tshusTheme),
      }}
    >
      <App>
        <AuthProvider>{children}</AuthProvider>
      </App>
    </ConfigProvider>
  );
};

export default ThemeContext;
