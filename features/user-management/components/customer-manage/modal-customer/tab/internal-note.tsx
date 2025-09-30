"use client";

import React, { useState } from "react";
import { Input, Button, Timeline, Spin } from "antd";
import { toast } from "react-toastify";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAddNote } from "@/features/user-management/hooks/staff-manage";
import { getListCustomersNote } from "@/features/user-management/apis/staff-manage";
import dayjs from "dayjs";
import { CustomerNoteDetail } from "@/types/customer-type";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";

dayjs.extend(utc);

interface NotesProps {
  selectedId: string;
}

const Notes = ({ selectedId }: NotesProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createNewNoteMutation = useAddNote();
  const [newNote, setNewNote] = useState("");

  // 🟢 Infinite Query for load more
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["customerNotes", selectedId],
      queryFn: ({ pageParam = 0 }) =>
        getListCustomersNote(
          {
            page: pageParam,
            page_size: 10,
          },
          selectedId
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.current_page + 1 < lastPage.total_pages) {
          return lastPage.current_page + 1;
        }
        return undefined;
      },
    });

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    createNewNoteMutation.mutate(
      { content: newNote.trim(), id: selectedId },
      {
        onSuccess: () => {
          toast.success(t("customerManage.internalNote.createSuccess"));
          queryClient.invalidateQueries({
            queryKey: ["customerNotes", selectedId],
          });
          setNewNote("");
        },
        onError: () => {
          toast.error(t("customerManage.internalNote.createFailed"));
        },
      }
    );
  };

  const notes = data?.pages.flatMap((page) => page.data) || [];

  // 🔹 Create items for Timeline according to new standard
  const timelineItems = notes.map((note: CustomerNoteDetail, index) => ({
    key: note.id,
    color: index === 0 ? "blue" : "gray",
    dot: (
      <span
        className={`w-2 h-2 rounded-full inline-block ml-0.5 mt-0.5 ${
          index === 0 ? "bg-blue-500" : "bg-gray-400"
        }`}
      />
    ),
    children: (
      <div>
        <p className="font-medium mt-2">
          {note.author_name} - {dayjs.utc(note.created_at).format("DD/MM/YYYY HH:mm")}
        </p>
        <p>{note.content}</p>
      </div>
    ),
  }));

  return (
    <div className="bg-white rounded-xl p-1">
      {/* Add note */}
      <div className="mb-4">
        <Input.TextArea
          rows={3}
          placeholder={t("customerManage.internalNote.placeholder")}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button type="primary" onClick={handleAddNote}>
            {t("customerManage.internalNote.saveNote")}
          </Button>
        </div>
      </div>

      {/* Note history */}
      <div>
        <h3 className="font-semibold mb-2">{t("customerManage.internalNote.noteHistory")}</h3>
        <div className="max-h-64 overflow-y-auto pr-2 !pt-2 !mt-2">
          {isLoading ? (
            <Spin />
          ) : (
            <Timeline mode="left" items={timelineItems} />
          )}
        </div>

        {/* Load more */}
        {hasNextPage && (
          <div className="flex justify-center mt-3">
            <Button onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
              {t("customerManage.internalNote.loadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;