import { GetProp, UploadProps } from 'antd';
import { SocketProps } from '../types/other/socket.type';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    // Reader Object
    const reader = new FileReader();

    // Read data from url
    reader.readAsDataURL(file);

    // Load
    reader.onload = () => resolve(reader.result as string);

    // Error
    reader.onerror = (error) => reject(error);
  });

// Check online
export const isOnline = (
  onlines: SocketProps[],
  isRooms: boolean,
  data: any,
) => {
  // Check type
  if (!isRooms) {
    // Finding
    const find = onlines?.find((s: SocketProps) => s?.user === data?.user);

    // Return
    return find;
  } else {
    return true;
  }
};
