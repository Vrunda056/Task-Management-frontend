"use client";

import { useState, type ComponentType } from "react";
import type { EntryType } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { Briefcase, Sun, Coffee, Palmtree } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface DayEntryModalProps {
  onClose: () => void;
}

export function DayEntryModal({ onClose }: DayEntryModalProps) {
  const { selectedDate, currentDayEntry, updateDayEntryType } = useTaskContext();

  const [entryType, setEntryType] = useState<EntryType>(
    currentDayEntry?.entryType ?? "WORKING_DAY",
  );

  const typeOptions: {
    type: EntryType;
    title: string;
    desc: string;
    icon: ComponentType<{ size?: number }>;
    colorClass: string;
    bgClass: string;
  }[] = [
    {
      type: "WORKING_DAY",
      title: "Working Day",
      desc: "Regular business working day for logging daily tasks and time",
      icon: Briefcase,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50 border-blue-200",
    },
    {
      type: "WEEKEND",
      title: "Weekend",
      desc: "Saturday or Sunday off-schedule",
      icon: Sun,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50 border-amber-200",
    },
    {
      type: "PUBLIC_HOLIDAY",
      title: "Public Holiday",
      desc: "National or regional holiday (e.g., Diwali, Christmas)",
      icon: Coffee,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50 border-emerald-200",
    },
    {
      type: "PERSONAL_LEAVE",
      title: "Personal Leave",
      desc: "Casual leave, sick leave, or vacation day",
      icon: Palmtree,
      colorClass: "text-rose-600",
      bgClass: "bg-rose-50 border-rose-200",
    },
  ];

  function handleSave() {
    updateDayEntryType(selectedDate, entryType);
    onClose();
  }

  return (
    <Modal
      onClose={onClose}
      title="Day Schedule Settings"
      subtitle={`Date: ${selectedDate}`}
      size="md"
    >
      <ModalBody>
        <span className="modal-label">Select Day Type:</span>
        <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {typeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = entryType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-purple bg-purple/5 ring-1 ring-purple shadow-xs"
                    : "border-line bg-card hover:border-slate-300 hover:bg-slate-50/50"
                }`}
                onClick={() => setEntryType(opt.type)}
              >
                <div
                  className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg border ${opt.bgClass} ${opt.colorClass}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <strong className="block text-xs font-semibold text-ink">
                    {opt.title}
                  </strong>
                  <p className="m-0 mt-0.5 text-[11px] leading-snug text-muted">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Schedule
        </Button>
      </ModalFooter>
    </Modal>
  );
}
