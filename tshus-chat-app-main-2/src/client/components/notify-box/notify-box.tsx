import { Button, Space } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { FC } from 'react';

type Props = {
  notify: NotificationInstance;
  title: string;
  id?: string;
};

const NotifyBox: FC<Props> = ({ notify, title, id }: Props) => {
  // Return
  return (
    <Space>
      <Button type="link" size="small" onClick={() => notify.destroy()}>
        {title}
      </Button>
      <Button type="primary" size="small" onClick={() => notify.destroy(id)}>
        Đóng
      </Button>
    </Space>
  );
};

export default NotifyBox;
