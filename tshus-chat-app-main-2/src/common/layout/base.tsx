import { Layout, theme } from 'antd';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

// Use Token
const { useToken } = theme;

const Base: FC = () => {
  // Toeken
  const { token } = useToken();

  // Return
  return (
    <Layout className="h-100" style={{ background: token.colorBgBase }}>
      <Outlet />
    </Layout>
  );
};

export default Base;
