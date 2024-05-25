import { Empty } from 'antd';
import * as React from 'react';

export interface IEmptyVerticalProps {
  desc: string;
}

export default function EmptyVertical({ desc }: IEmptyVerticalProps) {
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
