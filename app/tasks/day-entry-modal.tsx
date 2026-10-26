"use client";

import { useState, type ComponentType } from "react";
import type { EntryType } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { Briefcase, Sun, Coffee, Palmtree } from "lucide-react";

interface DayEntryModalProps {
  onClose: () => void;
}

export function DayEntryModal({ onClose }: DayEntryModalProps) {
  const { selectedDate, currentDayEntry, updateDayEntryType } = useTaskContext();

  const [entryType, setEntryType] = useState<EntryType>(
    currentDayEntry?.entryType ?? "WORKING_DAY"
  );
  
  const typeOptions: {
    type: EntryType;
    title: string;
    desc: string;
    icon: ComponentType<{ size?: number }>;
  }[] = [
    {
      type: "WORKING_DAY",
      title: "Working Day",
      desc: "Regular business working day for logging daily tasks and time",
      icon: Briefcase,
    },
    {
      type: "WEEKEND",
      title: "Weekend",
      desc: "Saturday or Sunday off-schedule",
      icon: Sun,
    },
    {
      type: "PUBLIC_HOLIDAY",
      title: "Public Holiday",
      desc: "National or regional holiday (e.g., Diwali, Christmas)",
      icon: Coffee,
    },
    {
      type: "PERSONAL_LEAVE",
      title: "Personal Leave",
      desc: "Casual leave, sick leave, or vacation day",
      icon: Palmtree,
    },
  ];

  function handleSave() {
    updateDayEntryType(selectedDate, entryType);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Day Schedule Settings</h2>
            <p className="text-xs text-muted mt-1 m-0">Date: {selectedDate}</p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <span className="modal-label">Select Day Type:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {typeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = entryType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-purple bg-purple-subtle/30 ring-1 ring-purple"
                      : "border-line bg-card hover:border-purple-border"
                  }`}
                  onClick={() => setEntryType(opt.type)}
                >
                  <div className="w-8.5 h-8.5 rounded-lg bg-purple-subtle text-purple grid place-items-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <strong className="block text-ink text-xs font-semibold">{opt.title}</strong>
                    <p className="m-0 mt-0.5 text-muted text-[11px] leading-snug">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
