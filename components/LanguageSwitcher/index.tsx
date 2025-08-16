'use client';

import { useTranslation } from 'react-i18next';
import { Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const items = [
    {
      key: 'vi',
      label: '🇻🇳 Tiếng Việt',
      onClick: () => changeLanguage('vi'),
    },
    {
      key: 'en',
      label: '🇺🇸 English',
      onClick: () => changeLanguage('en'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" >
      <a onClick={(e) => e.preventDefault()} className="flex items-center justify-center cursor-pointer h-10 w-10">
          <GlobalOutlined style={{ fontSize: 25 }} />
      </a>
    </Dropdown>
  );
};

export default LanguageSwitcher;
