import { FC } from 'react';
import { Button, Result } from 'antd';

const Page403: FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Xin lỗi, bạn không có quyền truy cập vào tài nguyên này."
    extra={<Button type="primary">Về trang chủ</Button>}
  />
);

export default Page403;
