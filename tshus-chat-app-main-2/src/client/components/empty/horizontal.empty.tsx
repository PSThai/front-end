import { Empty } from 'antd';

export interface IEmptyHorizontalProps {
  desc: string;
}

export default function EmptyHorizontal({ desc }: IEmptyHorizontalProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      description={desc}
    />
  );
}
