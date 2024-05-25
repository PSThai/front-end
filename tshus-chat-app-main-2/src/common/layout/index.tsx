import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Body from '@/common/layout/body';
import Sidebar from './sidebar';
import { FC } from 'react';

// Use Token
const { useToken } = theme;

const { Content } = Layout;

const Main: FC = () => {
  // Toeken
  const { token } = useToken();

  // Destructure Token
  const { colorBgContainer } = token;

  // Location
  const { pathname } = useLocation();

  const background = colorBgContainer;

  // Return
  return (
    <Layout className="h-100">
      <Layout>
        <Content style={{ display: 'flex', background }}>
          <Sidebar pathname={pathname}/>
          <Body pathname={pathname}>
            <Outlet />
          </Body>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
