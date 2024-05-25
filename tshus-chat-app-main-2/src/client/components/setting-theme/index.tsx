import { Button, Flex, Popover, Switch, Typography } from 'antd';
import { useConfig } from '@/common/hooks/use-config';
import { Gear } from '@phosphor-icons/react';
import { FC, useState } from 'react';

const SettingTheme: FC = () => {
  // Config
  const config = useConfig();

  // Open State
  const [open, setOpen] = useState<boolean>(false);

  // Open
  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);

  // Change Theme
  const changeTheme = (checked: boolean) =>
    config?.set('theme', checked ? 'DARK' : 'LIGHT');

  // Return
  return (
    <Popover
      content={
        <Flex align="center" gap={15}>
          <Typography.Text>Chủ đề</Typography.Text>
          <Switch
            checkedChildren="Tối"
            unCheckedChildren="Sáng"
            defaultChecked={config.get?.theme === 'DARK'}
            onChange={(checked) => changeTheme(checked)}
          />
        </Flex>
      }
      title="Cài đặt nhanh"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement='topRight'
    >
      <Button
        type="text"
        icon={<Gear size={22} />}
        style={{ color: "white" }}
      />
    </Popover>
  );
};

export default SettingTheme;
