"use client";
import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Checkbox,
  Divider,
  Row,
  Col,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewWebsite,
  useDeleteWebsite,
  useListRegion,
  useListRoutes,
  useListWebsite,
  useUpdateWebsite,
} from "../hooks/web-manage";
import { ColumnsType } from "antd/es/table";
import { Website } from "@/types/website-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";

const WebsiteManageTable: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState<string>(""); // 👈 thêm search state
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  const { data } = useListWebsite({
    page,
    size: 10,
    search: search || undefined,
  });
  const createNewWebMutation = useCreateNewWebsite();
  const updateWebMutation = useUpdateWebsite();
  const deleteWebMutation = useDeleteWebsite();

  const handleOpenModal = (record?: Website) => {
    if (record) {
      setEditingWebsite(record);
      form.setFieldsValue(record);
      setProxyEnabled(record.proxy_enabled || false);
    } else {
      setEditingWebsite(null);
      form.resetFields();
      setProxyEnabled(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const requestData = {
        name: values.name,
        domain: values.domain,
        region_id: values.region_id,
        currency_code: values.currency_code,
        route_id: values.route_id,
        use_selenium: values.use_selenium || false,
        proxy_enabled: values.proxy_enabled || false,
        proxy_host: values.proxy_enabled ? values.proxy_host : undefined,
        proxy_port: values.proxy_enabled ? values.proxy_port : undefined,
        proxy_username: values.proxy_enabled ? values.proxy_username : undefined,
        proxy_password: values.proxy_enabled ? values.proxy_password : undefined,
      };

      if (editingWebsite) {
        updateWebMutation.mutate(
          {
            id: editingWebsite.id,
            param: requestData,
          },
          {
            onSuccess: () => {
              toast.success(t("websiteManage.toast.updateSuccess"));
              queryClient.invalidateQueries({
                queryKey: ["listwebsite"],
              });
              setIsModalOpen(false);
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      } else {
        createNewWebMutation.mutate(
          requestData,
          {
            onSuccess: () => {
              toast.success(t("websiteManage.toast.createSuccess"));
              queryClient.invalidateQueries({
                queryKey: ["listwebsite"],
              });
              setIsModalOpen(false);
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      }
    });
  };
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleDelete = () => {
    deleteWebMutation.mutate(
      {
        id: +id,
      },
      {
        onSuccess: () => {
          toast.success(t("websiteManage.toast.deleteSuccess"));
          queryClient.invalidateQueries({
            queryKey: ["listwebsite"],
          });
          setOpenConfirmDeleteCate(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
    setId("null");
  };

  const handleOpenSelectorConfig = (record: Website) => {
    router.push(`/website-manage/selector-config?id=${record.id}`);
  };

  const { data: regionList } = useListRegion();
  const { data: routeList } = useListRoutes();

  const columns: ColumnsType<Website> = [
    { title: t("websiteManage.table.name"), dataIndex: "name", key: "name" },
    { title: "URL", dataIndex: "domain", key: "domain" },
    {
      title: t("websiteManage.table.region"),
      dataIndex: "region_id",
      key: "region_id",
      render: (region_id: number) => {
        const regionName = regionList?.data.find(
          (r: any) => r.id === region_id
        )?.name;
        return regionName ?? "-";
      },
    },
    {
      title: t("websiteManage.table.route"),
      dataIndex: "route_id",
      key: "route_id",
      render: (route_id: number) => {
        const routeName = routeList?.data.find(
          (r: any) => r.id === route_id
        )?.name;
        return routeName ?? "-";
      },
    },
    {
      title: "Configs",
      key: "configs",
      render: (_: any, record: Website) => {
        const configCount = record.selector_configs?.length || 0;
        return (
          <Tag color={configCount > 0 ? "green" : "default"}>
            {configCount} {configCount === 1 ? "config" : "configs"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: Website) => (
        <div className="space-x-2">
          <Button
            type="link"
            icon={<SettingOutlined />}
            className="!text-purple-500"
            onClick={() => handleOpenSelectorConfig(record)}
          >
            Config
          </Button>
          <Button
            type="link"
            className="!text-blue-500"
            onClick={() => handleOpenModal(record)}
          >
            {t("websiteManage.action.edit")}
          </Button>
          <Button
            type="link"
            className="!text-red-500"
            onClick={() => {
              setId(record.id.toString());
              setOpenConfirmDeleteCate(true);
            }}
          >
            {t("websiteManage.action.delete")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t("websiteManage.page.title")}</h2>
        <Button type="primary" onClick={() => handleOpenModal()}>
          + {t("websiteManage.page.add")}
        </Button>
      </div>

      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        rowHeight={45}
        pageSize={10}
        page={(data && data?.current_page + 1) || 0}
        onPageChange={handleChangePage}
        response={data}
        fontSize={14}
        headerHeight={44}
      />

      <Modal
        title={
          editingWebsite
            ? t("websiteManage.modal.editTitle")
            : t("websiteManage.modal.addTitle")
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("websiteManage.form.name")}
            name="name"
            rules={[
              { required: true, message: t("websiteManage.form.requiredName") },
            ]}
          >
            <Input placeholder={t("websiteManage.form.placeholderName")} />
          </Form.Item>

          <Form.Item
            label="URL"
            name="domain"
            rules={[
              { required: true, message: t("websiteManage.form.requiredUrl") },
            ]}
          >
            <Input placeholder={t("websiteManage.form.placeholderUrl")} />
          </Form.Item>

          <Form.Item
            label={t("websiteManage.form.region")}
            name="region_id"
            rules={[
              {
                required: true,
                message: t("websiteManage.form.requiredRegion"),
              },
            ]}
          >
            <Select placeholder={t("websiteManage.form.placeholderRegion")}>
              {regionList?.data?.map((region: any) => (
                <Select.Option key={region.id} value={region.id}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t("websiteManage.form.route")}
            name="route_id"
            rules={[
              {
                required: true,
                message: t("websiteManage.form.requiredRoute"),
              },
            ]}
          >
            <Select placeholder={t("websiteManage.form.placeholderRoute")}>
              {routeList?.data?.map((item: any) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t("websiteManage.form.currency")}
            name="currency_code"
            rules={[
              {
                required: true,
                message: t("websiteManage.form.requiredCurrency"),
              },
            ]}
          >
            <Select placeholder={""}>
              <Select.Option value="JPY">JPY</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
            </Select>
          </Form.Item>

          <Divider>Crawling Options</Divider>

          <Form.Item name="use_selenium" valuePropName="checked">
            <Checkbox>
              {t("websiteManage.form.useSelenium")}
            </Checkbox>
          </Form.Item>

          <Divider>Proxy Configuration (Optional)</Divider>

          <Form.Item name="proxy_enabled" valuePropName="checked">
            <Checkbox
              onChange={(e) => setProxyEnabled(e.target.checked)}
            >
              Enable Proxy
            </Checkbox>
          </Form.Item>

          {proxyEnabled && (
            <>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label="Proxy Host"
                    name="proxy_host"
                    rules={[
                      {
                        required: proxyEnabled,
                        message: "Please enter proxy host",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., proxy.example.com" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Proxy Port"
                    name="proxy_port"
                    rules={[
                      {
                        required: proxyEnabled,
                        message: "Please enter proxy port",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., 8080" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Proxy Username"
                    name="proxy_username"
                  >
                    <Input placeholder="Username (optional)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Proxy Password"
                    name="proxy_password"
                  >
                    <Input.Password placeholder="Password (optional)" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Modal>
      <PopupConfirm
        open={openConfirmDeleteCate}
        type={"delete"}
        title={t("websiteManage.delete.title")}
        content={t("websiteManage.delete.content")}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteCate(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default WebsiteManageTable;
