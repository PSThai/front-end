import NotifyBox from '@/client/components/notify-box/notify-box';
import { Link } from '@phosphor-icons/react';
import {
  App,
  Button,
  Popover,
  Space,
  Tag,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { Dispatch, FC, Fragment, memo, RefObject, SetStateAction } from 'react';

type Props = {
  fileList: UploadFile[];
  setFileList: Dispatch<SetStateAction<UploadFile[]>>;
  uploadBtn: RefObject<HTMLButtonElement>;
};

const ChatUploadFile: FC<Props> = ({
  fileList,
  setFileList,
  uploadBtn,
}: Props) => {
  // Notify
  const { notification } = App.useApp();

  // Handle custom request
  const handleCustomRequest: UploadProps['customRequest'] = (options: any) => {
    // Delay time 500
    setTimeout(() => {
      options?.onSuccess();
    }, 1000);
  };

  // Before upload
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // Check file type
    if (file.type.startsWith('image')) {
      // Key
      const key = `open${Date.now()}`;

      // Notify
      notification.error({
        message: 'Không thể tải lên ảnh',
        description: `
          Không thể tải lên hình ảnh ${file.name} có kiểu ${file.type},
          Chức năng này chỉ hỗ trợ tải lên các file và không hỗ trợ tải lên hình ảnh
        `,
        btn: <NotifyBox title="Đóng tất cả" notify={notification} id={key} />,
      });

      // Return
      return Upload.LIST_IGNORE;
    }
  };

  // Closed
  const onClosed = () => setFileList([]);

  // Handle change
  const handleChange: UploadProps['onChange'] = (info) => {
    // New file list data
    let newFileList = [...info.fileList];

    // Check type file
    if (info?.file?.type?.startsWith('image')) {
      // Remove last
      newFileList.pop();
    }

    // Set file list
    setFileList(newFileList);
  };

  // Upload Props
  const props: UploadProps = {
    fileList,
    beforeUpload,
    onChange: handleChange,
    customRequest: handleCustomRequest,
  };

  // Return
  return (
    <Fragment>
      <div style={{ display: 'none' }}>
        <Upload {...props} multiple>
          <Button hidden ref={uploadBtn} style={{ display: 'none' }} />
        </Upload>
      </div>
      {fileList?.length > 0 && (
        <Popover
          rootClassName="chat-file-upload-popover"
          content={
            <Upload {...props} multiple className="chat-file-upload-list" />
          }
          title="Các tệp tin đã tải lên"
          placement="topLeft"
        >
          <Space size="large">
            <Tag
              closable
              icon={<Link style={{ marginRight: 5 }} />}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '3px 7px',
                marginBottom: 2,
              }}
              onClose={onClosed}
            >
              {fileList?.length} tệp
            </Tag>
          </Space>
        </Popover>
      )}
    </Fragment>
  );
};

export default memo(ChatUploadFile);
