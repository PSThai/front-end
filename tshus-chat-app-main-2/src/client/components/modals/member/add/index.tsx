import { UsersThree } from '@phosphor-icons/react';
import { Button, Modal, Tooltip } from 'antd';
import { FC, useState } from 'react';
import FindAndSelectMember from './find';

const AddMemberToGroupModal: FC = () => {
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
      <Tooltip title="Thêm thành viên">
        <Button
          icon={<UsersThree size={20} />}
          onClick={showModal}
        />
      </Tooltip>
      <Modal
        footer={[]}
        open={open}
        onOk={handleOk}
        title="Thêm thành viên vào nhóm chat"
        onCancel={handleCancel}
      >
        <div style={{ paddingTop: 10 }}>
          <FindAndSelectMember changeOpen={setOpen} />
        </div>
      </Modal>
    </>
  );
};

export default AddMemberToGroupModal;
