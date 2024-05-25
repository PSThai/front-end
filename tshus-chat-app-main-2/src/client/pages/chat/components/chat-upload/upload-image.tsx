import NotifyBox from '@/client/components/notify-box/notify-box';
import { Link } from '@phosphor-icons/react';
import {
  App,
  Button,
  GetProp,
  Modal,
  Popover,
  Tag,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import React from 'react';

type Props = {
  imageList: UploadFile[];
  setImageList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  uploadBtn: React.RefObject<HTMLButtonElement>;
};

//  File type
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// Get base64 data image
const getBase64 = (file: FileType): Promise<string> =>
  // Return
  new Promise((resolve, reject) => {
    // Render
    const reader = new FileReader();
    // Read Data
    reader.readAsDataURL(file);

    // Onload
    reader.onload = () => resolve(reader.result as string);

    // On Error
    reader.onerror = (error) => reject(error);
  });

const ChatUploadImage: React.FC<Props> = ({
  imageList,
  setImageList,
  uploadBtn,
}: Props) => {
  // Preview state
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Preview image
  const [previewImage, setPreviewImage] = React.useState('');

  // Preview title
  const [previewTitle, setPreviewTitle] = React.useState('');

  // Notify
  const {notification} = App.useApp();

  // Handle preview
  const handlePreview = async (file: UploadFile) => {
    // Check file url and review
    if (!file.url && !file.preview) {
      // Get base64 and set data
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    // Set preview image
    setPreviewImage(file.url || (file.preview as string));

    // Enable preview
    setPreviewOpen(true);

    // Set preview title is file name
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1),
    );
  };

  const handleCancel = () => {
    // Set preview
    setPreviewOpen(false);
  };

  // Handle custom request
  const handleCustomRequest: UploadProps['customRequest'] = (options: any) => {
    // Succcess
    options?.onSuccess();
  };

    // Check file typea
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image') && !file.type.startsWith('video')) {
      const key = `open${Date.now()}`;
      notification.error({
        message: 'Không thể tải lên tệp tin',
        description: `
          Không thể tải lên tệp tin ${file.name} có kiểu ${file.type},
          Chức năng này chỉ hỗ trợ tải lên các dạng hình ảnh và video
        `,
        btn: <NotifyBox title="Đóng tất cả" notify={notification} id={key} />,
      });
      return Upload.LIST_IGNORE;
    }
  };
  

  // Handle change
  const handleChange: UploadProps['onChange'] = (info) => {
    // Check type file
    if (info?.file?.type?.startsWith('image') || info?.file?.type?.startsWith('video')) {
      // New file list data`
      let newImageList = [...info.fileList];

      // Set file list
      setImageList(newImageList);
    }
  };

  // Upload Props
  const props: UploadProps = {
    fileList: imageList,
    multiple: true,
    beforeUpload,
    listType: 'picture-card',
    onChange: handleChange,
    customRequest: handleCustomRequest,
  };

  // Return
  return (
    <React.Fragment>
      <div style={{ display: 'none' }}>
        <Upload style={{ display: 'none' }} {...props}>
          <Button hidden ref={uploadBtn} style={{ display: 'none' }} />
        </Upload>
      </div>
      <Modal
        width={'70%'}
        open={previewOpen}
        centered
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      {imageList?.length > 0 && (
        <Popover
          content={
            <React.Fragment>
              <Upload {...props} onPreview={handlePreview} />
            </React.Fragment>
          }
          title="Các hình ảnh đã tải lên"
          placement="topLeft"
        >
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
            onClose={() => {
              setImageList([]);
            }}
          >
            {imageList?.length} ảnh
          </Tag>
        </Popover>
      )}
    </React.Fragment>
  );
};

export default ChatUploadImage;
