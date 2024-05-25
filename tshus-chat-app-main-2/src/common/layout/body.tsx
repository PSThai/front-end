import { Flex, Typography } from 'antd';
import { FC, ReactNode } from 'react';

const { Text } = Typography;

type Props = {
  children: ReactNode;
  pathname: string;
};
const Body: FC<Props> = ({ children, pathname }: Props) => {
  return (
    <div style={{ width: '100%' }}>
      {pathname?.startsWith('/admin') && (
        <Flex style={{ padding: '10px 20px' }}>
          <Text style={{ fontSize: 17 }}>QUẢN TRỊ HỆ THỐNG</Text>
        </Flex>
      )}

      {children}
    </div>
  );
};

export default Body;
