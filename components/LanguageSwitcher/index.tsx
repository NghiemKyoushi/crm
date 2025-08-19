'use client';

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLanguage(lng);
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
    <Dropdown
      menu={{
        items,
        selectedKeys: [language],
      }}
      placement="bottomRight"
    >
      <a
        onClick={(e) => e.preventDefault()}
        className="flex items-center justify-center cursor-pointer h-10 w-10"
        title={language === 'vi' ? 'Tiếng Việt' : 'English'}
      >
        <GlobalOutlined className='!text-blue-400' style={{ fontSize: 25 }} />
      </a>
    </Dropdown>
  );
};

export default LanguageSwitcher;
