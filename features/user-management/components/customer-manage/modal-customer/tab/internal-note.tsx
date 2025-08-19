"use client";

import React, { useState } from "react";
import { Input, Button, Timeline } from "antd";
import dayjs from "dayjs";

interface Note {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      author: "John Doe",
      content:
        "Đã liên hệ khách hàng tư vấn về chính sách VIP. Khách hàng rất quan tâm.",
      createdAt: "2025-08-01 14:20",
    },
    {
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },
    {
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },
    {
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },
    {
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },
    {
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },{
      id: 2,
      author: "Jane Smith",
      content:
        "Khách hàng hỏi về tình trạng đơn hàng #OD2240, đã báo hàng đang trên đường về VN.",
      createdAt: "2025-07-25 09:00",
    },
  ]);

  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const newEntry: Note = {
      id: Date.now(),
      author: "Bạn", // có thể lấy từ user login
      content: newNote.trim(),
      createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
    };

    setNotes([newEntry, ...notes]);
    setNewNote("");
  };

  return (
    <div className=" bg-white rounded-xl shadow-md">
      {/* Thêm ghi chú */}
      <div className="mb-4">
        <Input.TextArea
          rows={3}
          placeholder="Nhân viên thêm ghi chú về khách hàng tại đây..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button type="primary" onClick={handleAddNote}>
            Lưu ghi chú
          </Button>
        </div>
      </div>

      {/* Lịch sử ghi chú */}
      <div>
        <h3 className="font-semibold mb-2">Lịch sử Ghi chú</h3>
        <div className="max-h-64 overflow-y-auto pr-2 !pt-2 !mt-2">
          <Timeline mode="left">
            {notes.map((note, index) => (
              <Timeline.Item
                key={note.id}
                color={index === 0 ? "blue" : "gray"}
                dot={
                  <span
                    className={`w-2 h-2 rounded-full inline-block  ml-0.5 mt-0.5 ${
                      index === 0 ? "bg-blue-500" : "bg-gray-400"
                    }`}
                  />
                }
              >
                <p className="font-medium mt-2">
                  {note.author} - {note.createdAt}
                </p>
                <p>{note.content}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </div>
  );
};

export default Notes;
