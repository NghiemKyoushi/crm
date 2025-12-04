import React, { useState } from "react";
import { Form, Input, Button, Card, Select, Tooltip, Space } from "antd";
import {
    ClockCircleOutlined, TrophyOutlined, SettingOutlined, WarningOutlined,
    DollarOutlined, UserOutlined
} from "@ant-design/icons";

const { Item } = Form;
const { Option } = Select;

interface VipPackage {
    name: string;
    price: number;
}

interface SettingsData {
    minSafeTime: number;
    maxViolations: number;
    vipPackages: VipPackage[];
    yahooAccounts: string[];
}

const mockInitialValues: SettingsData = {
    minSafeTime: 15,
    maxViolations: 3,
    vipPackages: [
        { name: "VIP 1 (2 slot)", price: 1000000 },
        { name: "VIP 2 (50 slot)", price: 2000000 }
    ],
    yahooAccounts: ["yahoo_acc_01", ""], // Hiển thị mặc định 2 input, input thứ hai trống
};

const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
};

const parseCurrency = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    const cleaned = value.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
};

export const TabSettings = () => {
    const [form] = Form.useForm<SettingsData>();
    const [loading, setLoading] = useState(false);

    const onFinish = (values: SettingsData) => {
        setLoading(true);
        console.log("Cài đặt đã lưu:", values);

        // FAKE API CALL
        setTimeout(() => {
            alert("Đã lưu cài đặt thành công!");
            setLoading(false);
        }, 1000);
    };

    const renderCardTitle = (icon: React.ReactNode, title: string) => (
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-base">{title}</span>
        </div>
    );

    const fixedVipNames = [
        "VIP 1 (2 slot)",
        "VIP 2 (50 slot)",
        "VIP 3 (100 slot)",
        "VIP 4 (Không giới hạn)"
    ];

    // Helper to keep always 2 inputs for each group
    const getVipPackagesFields = () => {
        const vipPackages = form.getFieldValue("vipPackages") || [];
        if (vipPackages.length >= 2) return vipPackages.slice(0, 2);
        if (vipPackages.length === 1) return [...vipPackages, { name: "", price: undefined }];
        return [{ name: "", price: undefined }, { name: "", price: undefined }];
    };
    const getYahooAccountsFields = () => {
        const yahooAccounts = form.getFieldValue("yahooAccounts") || [];
        if (yahooAccounts.length >= 2) return yahooAccounts.slice(0, 2);
        if (yahooAccounts.length === 1) return [...yahooAccounts, ""];
        return ["", ""];
    };

    // Ensure 2 input transform on submit/reset
    React.useEffect(() => {
        const initial = form.getFieldsValue();
        if (
            (!initial.vipPackages || initial.vipPackages.length < 2) ||
            (!initial.yahooAccounts || initial.yahooAccounts.length < 2)
        ) {
            form.setFieldsValue({
                ...initial,
                vipPackages: getVipPackagesFields(),
                yahooAccounts: getYahooAccountsFields(),
            });
        }
    }, [form]);

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
            <Form
                form={form}
                layout="vertical"
                initialValues={mockInitialValues}
                onFinish={onFinish}
                className="space-y-6"
            >
                {/* 1. THỜI GIAN & VI PHẠM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thẻ Thời gian an toàn tối thiểu */}
                    <Card
                        title={renderCardTitle(<ClockCircleOutlined className="text-blue-500" />, "Thời gian")}
                        className="rounded-xl shadow-sm border border-gray-200"
                    >
                        <Item
                            name="minSafeTime"
                            label={<span className="font-medium text-gray-700">Thời gian an toàn tối thiểu (giây)</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                        >
                            <Input
                                type="number"
                                min={1}
                                addonAfter="giây"
                                placeholder="E.g., 15"
                                className="!h-10 !rounded-lg"
                            />
                        </Item>
                    </Card>

                    {/* Thẻ Số lần vi phạm tối đa */}
                    <Card
                        title={renderCardTitle(<WarningOutlined className="text-red-500" />, "Vi phạm")}
                        className="rounded-xl shadow-sm border border-gray-200"
                    >
                        <Item
                            name="maxViolations"
                            label={<span className="font-medium text-gray-700">Số lần vi phạm tối đa</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập số lần' }]}
                        >
                            <Input
                                type="number"
                                min={0}
                                placeholder="E.g., 3"
                                className="!h-10 !rounded-lg"
                            />
                        </Item>
                    </Card>
                </div>

                {/* 2+3. GÓI VIP VÀ YAHOO HIỂN THỊ CÙNG HÀNG */}
                <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                    {/* Gói VIP */}
                    <Card
                        title={renderCardTitle(<TrophyOutlined className="text-yellow-600" />, "Gói VIP")}
                        className="rounded-xl shadow-sm border border-gray-200 flex-1"
                    >
                        <div className="space-y-4">
                            {getVipPackagesFields().map((vip: any, idx: number) => (
                                <Space key={idx} className="flex items-end gap-4 w-full" align="start">
                                    <Item
                                        name={['vipPackages', idx, 'name']}
                                        label={<span className="font-medium text-gray-700">Tên gói</span>}
                                        className="flex-1 w-[200px]"
                                        rules={[{ required: true, message: 'Vui lòng chọn tên gói' }]}
                                    >
                                        <Select placeholder="Chọn gói VIP" className="!h-10 !rounded-lg">
                                            {fixedVipNames.map((n) => (
                                                <Option key={n} value={n}>{n}</Option>
                                            ))}
                                        </Select>
                                    </Item>
                                    <Item
                                        name={['vipPackages', idx, 'price']}
                                        label={<span className="font-medium text-gray-700">Giá (VND)</span>}
                                        className="flex-1 w-[160px]"
                                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                                    >
                                        <Input
                                            placeholder="E.g., 1,000,000"
                                            className="!h-10 !rounded-lg"
                                            prefix={<DollarOutlined className="text-gray-400" />}
                                            onChange={(e) => {
                                                const parsed = parseCurrency(e.target.value);
                                                if (parsed !== undefined) {
                                                    const packages = getVipPackagesFields();
                                                    packages[idx] = { ...packages[idx], price: parsed };
                                                    form.setFieldsValue({ vipPackages: packages });
                                                }
                                            }}
                                            value={formatCurrency(form.getFieldValue(['vipPackages', idx, 'price']))}
                                            onBlur={(e) => {
                                                const parsed = parseCurrency(e.target.value);
                                                if (parsed !== undefined) {
                                                    const packages = getVipPackagesFields();
                                                    packages[idx] = { ...packages[idx], price: parsed };
                                                    form.setFieldsValue({ vipPackages: packages });
                                                }
                                            }}
                                        />
                                    </Item>
                                </Space>
                            ))}
                        </div>
                    </Card>
                    {/* Yahoo Account */}
                    <Card
                        title={renderCardTitle(<UserOutlined className="text-gray-600" />, "Tài khoản Yahoo")}
                        className="rounded-xl shadow-sm border border-gray-200 flex-1"
                    >
                        <div className="space-y-4">
                            {getYahooAccountsFields().map((account: any, idx: number) => (
                                <Item
                                    key={idx}
                                    name={["yahooAccounts", idx]}
                                    label={<span className="font-medium text-gray-700">Tài khoản</span>}
                                    className="w-full"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]}
                                >
                                    <Input
                                        placeholder="E.g., yahoo_acc_01"
                                        className="!h-10 !rounded-lg"
                                    />
                                </Item>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Footer - Nút Lưu */}
                <div className="pt-4 border-t">
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        icon={<SettingOutlined />}
                        className="!h-12 !px-8 !rounded-lg !font-bold"
                    >
                        Lưu cài đặt
                    </Button>
                </div>
            </Form>
        </div>
    );
};