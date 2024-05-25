import { UsersThree } from '@phosphor-icons/react';
import { Button, Modal } from 'antd';
import { FC, useState } from 'react';
import FindAndSelectFriend from './find';

const CreateGroupModal: FC = () => {
  // Open State
  const [open, setOpen] = useState(false);

  const showModal = () => setOpen(true);

  const handleOk = () => setOpen(false);

  const handleCancel = () => {
    // Set open
    setOpen(false);
  };

  // Return
  return (
    <>
      <Button type="text" icon={<UsersThree size={20} />} onClick={showModal} />
      <Modal
        title="Thêm thành viên vào nhóm chat"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[]}
      >
        <div style={{ paddingTop: 10 }}>
          <FindAndSelectFriend changeOpen={setOpen} />
        </div>
      </Modal>
    </>
  );
};

export default CreateGroupModal;
