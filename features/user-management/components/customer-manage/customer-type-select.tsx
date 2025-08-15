import { Select } from 'antd';

interface Props {
  value: string;
}

export default function CustomerTypeSelect({ value }: Props) {
  return (
    <Select
      value={value}
      className="min-w-[100px]"
      options={[
        { label: 'VIP', value: 'VIP' },
        { label: 'Bạc', value: 'Bạc' },
        { label: 'Vàng', value: 'Vàng' },
      ]}
    />
  );
}
