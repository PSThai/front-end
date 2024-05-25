import { Button, Result } from 'antd';
import { FC } from 'react';

const Page404: FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Trang mà bạn truy cập không tồn tại."
    extra={<Button type="primary">Về trang chủ</Button>}
  />
);

export default Page404;
