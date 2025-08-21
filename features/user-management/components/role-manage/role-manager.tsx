"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox } from "antd";
import clsx from "clsx";
import { permissionsGrouped, RoleFormValues, RoleModal } from "./role-modal";
import { useListRole } from "../../hooks/staff-manage";
import { Role } from "@/types/roles";

export const RoleManager: React.FC = () => {
  // const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>();
  const [openModal, setOpenModal] = useState(false);
  
    const { data } = useListRole();
  const handleAddRole = (data: RoleFormValues) => {
    const newRole: Role = {
      role_name: data.name,
      permissions: data.permissions,
    };
    // setRoles((prev) => [...prev, newRole]);
  };

  useEffect(()=>{
    if(data){
      setSelectedRole(data[0])

    }
  },[data])

  return (
    <div className="flex gap-6 w-full">
      <div className="w-1/4 bg-white shadow rounded p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Các Vai trò</h3>
          <Button type="primary" onClick={() => setOpenModal(true)}>
            + Thêm Vai trò
          </Button>
        </div>
        <div className="space-y-1">
          {data && data.map((role: Role) => (
            <div
              key={role.role_id}
              className={clsx(
                "cursor-pointer px-3 py-2 rounded hover:bg-gray-100 min-h-12 flex items-center align-middle ",
                selectedRole?.role_id === role.role_id && "bg-blue-100 text-blue-700 font-medium"
              )}
              onClick={() => setSelectedRole(role)}
            >
              {role.role_name}
            </div>
          ))}
        </div>
      </div>

     <div className="w-3/4 bg-white shadow rounded p-4">
  {selectedRole ? (
    <>
      <h3 className="font-semibold text-lg mb-4">
        Quyền hạn cho vai trò:{" "}
        {/* <span className="text-blue-600">{selectedRole.name}</span> */}
      </h3>

      {/* Duyệt qua từng nhóm */}
      <div className="space-y-4">
        {permissionsGrouped.map((group) => (
          <div key={group.group}>
            <h4 className="font-medium mb-2">{group.group}</h4>
            <Checkbox.Group
              options={group.items}
              value={selectedRole.permissions}
              onChange={(checkedValues) => {
                setSelectedRole((prev) =>
                  prev
                    ? { ...prev, permissions: checkedValues as string[] }
                    : prev
                );
              }}
              className="flex flex-col  gap-2"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button
          type="primary"
          onClick={() => {
            // setRoles((prev) =>
            //   prev.map((r) =>
            //     r.id === selectedRole.id ? selectedRole : r
            //   )
            // );
          }}
        >
          Lưu thay đổi
        </Button>
      </div>
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
