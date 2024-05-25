import { Button, Popover, theme } from 'antd';
import  { FC, Fragment, useState } from 'react';
import { SmileyWink } from '@phosphor-icons/react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useConfig } from '@/common/hooks/use-config';

// Use Token
const { useToken } = theme;

type Props = {
  onSelect: Function;
};

const EmojiPick: FC<Props> = ({ onSelect }: Props) => {
  // Toeken
  const { token } = useToken();

  // Open State
  const [open, setOpen] = useState(false);

  // Config
  const config = useConfig();

  // Open
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  // Return
  return (
    <Fragment>
      <Popover
        rootClassName="emoji-picker"
        content={
          <Picker
            data={data}
            previewPosition="none"
            theme={config?.get.theme}
            onEmojiSelect={onSelect}
          />
        }
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        style={{ padding: 0 }}
      >
        <Button
          icon={<SmileyWink size={20} />}
          type="text"
          style={{
            color: token.colorTextSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Popover>
    </Fragment>
  );
};

export default EmojiPick;
