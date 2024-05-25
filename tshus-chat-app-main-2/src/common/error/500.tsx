import { FC } from 'react';
import { Button, Result } from 'antd';

const Page500: FC = () => (
  <Result
    status="500"
    title="500"
    subTitle="Xin lỗi vì sự bất tiện vì đã có lỗi xảy ra ở phía server, vui lòng thử lại sau"
    extra={<Button type="primary">Trở về trang chủ</Button>}
  />
);

export default Page500;
