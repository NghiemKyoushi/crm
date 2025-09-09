/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button, Checkbox, Tag } from "antd";
import clsx from "clsx";
import { renderCategoryName, RoleFormValues, RoleModal } from "./role-modal";
import {
  useCreateNewRole,
  useListRole,
  useUpdateRole,
} from "../../hooks/staff-manage";
import { Role } from "@/types/roles";
import { getListPermiss } from "../../apis/staff-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

interface PermissionGroup {
  group_id: number;
  group_name: string;
  permissions: {
    permission: string;
    description: string;
    group_id: number;
    is_system: boolean;
    name: string;
  }[];
}

export const RoleManager: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const { data } = useListRole();
  const queryClient = useQueryClient();
  const createRoleMutation = useCreateNewRole();
  const updateRoleMutation = useUpdateRole();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );

  const handleAddRole = (data: RoleFormValues) => {
    const { description, name, permissions } = data;
    createRoleMutation.mutate(
      {
        description,
        role_name: name,
        permissions,
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success("Tạo vai trò mới thành công!");
          queryClient.invalidateQueries({ queryKey: ["listRole"] });
        },
        onError: () => {
          toast.error("Tạo vai trò mới thất bại");
        },
      }
    );
  };

  const hadnleUpdateRole = (roleSelect: Role) => {
    if (selectedRole) {
      const activePermissionNames = roleSelect.groups.flatMap(
        (group: { permissions: any[] }) =>
          group.permissions.filter((p) => p.active).map((p) => p.name)
      );
      updateRoleMutation.mutate(
        {
          param: {
            description: selectedRole?.description,
            role_name: selectedRole?.role_name,
            permissions: activePermissionNames,
            is_active: true,
          },
          id: selectedRole.role_id,
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật vai trò thành công");
            queryClient.invalidateQueries({ queryKey: ["listRole"] });
          },
          onError: () => {
            toast.error("Cập nhật vai trò thất bại");
          },
        }
      );
    }
  };

  useEffect(() => {
    if (data) {
      setSelectedRole(data[0]);
    }
  }, [data]);

  const handleCallPer = async () => {
    const groups = await getListPermiss();
    setPermissionGroups(groups);
  };

  useEffect(() => {
    handleCallPer();
  }, []);

  const isSuperAdmin = selectedRole?.role_name === "ADMIN";

  return (
    <div className="flex gap-6 w-full">
      <div className="w-1/3 bg-white shadow rounded p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Các Vai trò</h3>
          <Button
            size="middle"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            + Thêm vai trò
          </Button>
        </div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {data &&
            data.map((role: Role) => (
              <div
                key={role.role_id}
                className={clsx(
                  "cursor-pointer px-3 py-2 rounded hover:bg-gray-100 min-h-12 flex items-center justify-between",
                  selectedRole?.role_id === role.role_id &&
                    "bg-blue-100 text-blue-700 font-medium"
                )}
                onClick={() => setSelectedRole(role)}
              >
                <span>{role.role_name}</span>
                {role.role_name === "ADMIN" && (
                  <Tag color="red" className="ml-2">
                    Super Admin
                  </Tag>
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="w-3/4 bg-white shadow rounded p-4">
        {selectedRole ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Quyền hạn cho vai trò:{" "}
                <span className="text-blue-600">{selectedRole.role_name}</span>
              </h3>
              {isSuperAdmin && (
                <Tag color="red" className="font-semibold">
                  Super Admin
                </Tag>
              )}
            </div>
            {permissionGroups.map((group) => {
              console.log("group", group);

              const roleGroup = selectedRole?.groups?.find(
                (g: any) => g.id === group.group_id
              );
              const activePermissions =
                roleGroup?.permissions
                  .filter((p: any) => p.active)
                  .map((p: any) => p.name) || [];
              console.log("group44444", group);

              return (
                <div key={group.group_id}>
                  <h4 className="font-medium !mb-3 !mt-3">
                    {renderCategoryName(group.group_name)}
                  </h4>
                  {group.permissions && (
                    <Checkbox.Group
                      options={group.permissions.map((p) => ({
                        label: p.description,
                        value: p.permission,
                      }))}
                      value={activePermissions}
                      disabled={isSuperAdmin}
                      onChange={(checkedValues) => {
                        if (isSuperAdmin) return;
                        setSelectedRole((prev) =>
                          prev
                            ? {
                                ...prev,
                                groups: prev.groups.map((g: any) => {
                                  if (g.id !== group.group_id) return g;

                                  return {
                                    ...g,
                                    permissions: g.permissions.map(
                                      (p: any) => ({
                                        ...p,
                                        active: checkedValues.includes(p.name),
                                      })
                                    ),
                                  };
                                }),
                              }
                            : prev
                        );
                      }}
                      className="flex flex-col gap-3"
                    />
                  )}
                </div>
              );
            })}

            {!isSuperAdmin && (
              <div className="flex justify-end mt-4">
                <Button
                  type="primary"
                  onClick={() => {
                    hadnleUpdateRole(selectedRole);
                  }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </>
        ) : (
          <p>Chọn một vai trò để xem chi tiết</p>
        )}
      </div>

      <RoleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddRole}
      />
    </div>
  );
};
