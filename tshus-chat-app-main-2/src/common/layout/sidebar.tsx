import { adminRoute, publicClientRoutes } from '@/common/routes/routes';
import { Button, Flex, Tooltip, theme } from 'antd';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import SettingTheme from '@/client/components/setting-theme';
import UserProfile from '@/client/components/user-profile';

// Use Token
const { useToken } = theme;

type Props = {
  pathname: string;
};

const Sidebar: FC<Props> = ({ pathname }: Props) => {

  // Toeken
  const { token } = useToken();

  // Return
  return (
    <Flex
      vertical
      align="center"
      justify="space-between"
      style={{
        padding: '18px',
        backgroundColor: token.colorPrimary,
      }}
    >
      <Flex vertical gap={12} align="center">
        {(pathname?.startsWith('/admin')
          ? adminRoute
          : publicClientRoutes
        )?.map((item: any, index: number) => (
          <Tooltip key={index} placement="rightTop" title={item.name}>
            <Link
              to={
                pathname?.startsWith('/admin')
                  ? `/admin/${item.path}`
                  : item.path
              }
            >
              <Button
                type="text"
                size="large"
                style={{
                  background:
                    pathname === item.path ? 'rgb(255 255 255 / 20%)' : '',
                }}
              >
                {<item.icon size={22} style={{ color: 'white' }} />}
              </Button>
            </Link>
          </Tooltip>
        ))}
      </Flex>
      <Flex vertical gap={12} align="center">
        <SettingTheme />
        <UserProfile />
      </Flex>
    </Flex>
  );
};

export default Sidebar;
