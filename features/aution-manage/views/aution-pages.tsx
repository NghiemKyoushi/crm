"use client";

import React from "react";
import { Tabs } from "antd";
import { LinkOutlined, UserOutlined, TrophyOutlined } from "@ant-design/icons"; 
// Import các icon cần thiết

// Giả định TabLink, TabCustomer, TabResult đã được định nghĩa và import chính xác
import { TabLink } from "../components/tab-link"; 
import { TabCustomer } from "../components/tab-customer";
import { TabResult } from "../components/tab-result";

// --- Custom Label Component để hiển thị Icon và Text ---
const TabLabel = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold">{text}</span>
    </div>
);


export const AuctionPage = () => {
    return (
        <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100">
            <Tabs
                defaultActiveKey="1"
                type="line"
                items={[
                    { 
                        key: "1", 
                        // Sử dụng JSX Label với Icon và Text
                        label: <TabLabel icon={<LinkOutlined />} text="Theo link" />, 
                        children: <TabLink /> 
                    },
                    { 
                        key: "2", 
                        label: <TabLabel icon={<UserOutlined />} text="Theo khách" />, 
                        children: <TabCustomer /> 
                    },
                    { 
                        key: "3", 
                        label: <TabLabel icon={<TrophyOutlined />} text="Thắng thua" />, 
                        children: <TabResult /> 
                    },
                    // Thêm các tab khác theo yêu cầu UI
                    { 
                        key: "4", 
                        label: <TabLabel icon={<UserOutlined />} text="Khách hàng VIP" />, 
                        children: <div className="p-4">Nội dung Khách hàng VIP...</div> 
                    },
                    { 
                        key: "5", 
                        label: <TabLabel icon={<TrophyOutlined />} text="Vi phạm" />, 
                        children: <div className="p-4">Nội dung Vi phạm...</div> 
                    },
                    { 
                        key: "6", 
                        label: <TabLabel icon={<LinkOutlined />} text="Cài đặt" />, 
                        children: <div className="p-4">Nội dung Cài đặt...</div> 
                    },
                ]}
                className="custom-tabs-auction [&_.ant-tabs-content-holder]:!p-0"
            />
            
        </div>
    );
};

export default AuctionPage;