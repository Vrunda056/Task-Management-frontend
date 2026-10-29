"use client";

import { useState } from "react";
import type { Task, TaskItem } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { Timer, Clock, Play, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface TimerSettingsModalProps {
  task: Task;
  item: TaskItem;
  onClose: () => void;
}

export function TimerSettingsModal({
  task,
  item,
  onClose,
}: TimerSettingsModalProps) {
  const { startTimer, logManualTime, updateTaskItem } = useTaskContext();

  const [activeTab, setActiveTab] = useState<"timer" | "manual">("timer");

  // Timer tab state
  const [selectedPreset, setSelectedPreset] = useState<number>(
    item.estimatedTimeMin ?? 25,
  );
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [timerMode, setTimerMode] = useState<"countdown" | "stopwatch">("countdown");

  // Manual tab state
  const [manualMinutes, setManualMinutes] = useState<number>(
    item.actualEffortMin ?? item.estimatedTimeMin ?? 30,
  );
  const [manualNote, setManualNote] = useState<string>(item.note ?? "");
  const [markComplete, setMarkComplete] = useState<boolean>(
    item.status === "COMPLETED",
  );

  const presets = [15, 25, 45, 60, 90];

  function handleStartTimer() {
    let target = selectedPreset;
    if (customMinutes && !isNaN(Number(customMinutes)) && Number(customMinutes) > 0) {
      target = Math.round(Number(customMinutes));
    }

    startTimer(task, item, {
      mode: timerMode,
      targetMinutes: target,
    });
    onClose();
  }

  function handleSaveManualTime() {
    logManualTime(item.id, manualMinutes, manualNote.trim() || undefined);
    if (markComplete) {
      updateTaskItem(item.id, { status: "COMPLETED" });
    }
    onClose();
  }

  return (
    <Modal
      onClose={onClose}
      title="Timer & Effort Tracker"
      subtitle={item.description}
    >
      {/* Tabs */}
      <div className="flex border-b border-line bg-canvas/30 px-6">
        <button
          type="button"
          className={`relative inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-4 py-3 text-xs font-semibold transition-colors ${
            activeTab === "timer"
              ? "border-b-2 border-b-purple text-purple"
              : "text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("timer")}
        >
          <Timer size={15} />
          <span>Live Timer</span>
        </button>
        <button
          type="button"
          className={`relative inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-4 py-3 text-xs font-semibold transition-colors ${
            activeTab === "manual"
              ? "border-b-2 border-b-purple text-purple"
              : "text-muted hover:text-ink"
          }`}
          onClick={() => setActiveTab("manual")}
        >
          <Clock size={15} />
          <span>Manual Log / Note</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {activeTab === "timer" ? (
          <div>
            <div className="mb-4.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card p-3 transition-all ${
                  timerMode === "countdown"
                    ? "border-purple bg-purple-subtle/30 ring-1 ring-purple"
                    : "border-line hover:border-purple-border"
                }`}
              >
                <input
                  type="radio"
                  name="timerMode"
                  value="countdown"
                  className="mt-1"
                  checked={timerMode === "countdown"}
                  onChange={() => setTimerMode("countdown")}
                />
                <div>
                  <strong className="block text-xs font-semibold text-ink">Target Countdown</strong>
                  <p className="m-0 mt-0.5 text-[11px] leading-snug text-muted">Focus timer that notifies you when target effort is reached</p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card p-3 transition-all ${
                  timerMode === "stopwatch"
                    ? "border-purple bg-purple-subtle/30 ring-1 ring-purple"
                    : "border-line hover:border-purple-border"
                }`}
              >
                <input
                  type="radio"
                  name="timerMode"
                  value="stopwatch"
                  className="mt-1"
                  checked={timerMode === "stopwatch"}
                  onChange={() => setTimerMode("stopwatch")}
                />
                <div>
                  <strong className="block text-xs font-semibold text-ink">Stopwatch</strong>
                  <p className="m-0 mt-0.5 text-[11px] leading-snug text-muted">Counts up continuously until you pause or stop</p>
                </div>
              </label>
            </div>

            {timerMode === "countdown" && (
              <div>
                <span className="modal-label">Choose Target Duration:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map((min) => (
                    <button
                      key={min}
                      type="button"
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedPreset === min && !customMinutes
                          ? "border-purple bg-purple-subtle font-bold text-purple"
                          : "border-line bg-card text-ink-secondary hover:border-purple-border hover:bg-purple-subtle/20"
                      }`}
                      onClick={() => {
                        setSelectedPreset(min);
                        setCustomMinutes("");
                      }}
                    >
                      {min} min {min === 25 ? "⚡ Pomodoro" : ""}
                    </button>
                  ))}
                  {item.estimatedTimeMin && !presets.includes(item.estimatedTimeMin) && (
                    <button
                      type="button"
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedPreset === item.estimatedTimeMin && !customMinutes
                          ? "border-purple bg-purple-subtle font-bold text-purple"
                          : "border-line bg-card text-ink-secondary hover:border-purple-border hover:bg-purple-subtle/20"
                      }`}
                      onClick={() => {
                        setSelectedPreset(item.estimatedTimeMin!);
                        setCustomMinutes("");
                      }}
                    >
                      {item.estimatedTimeMin} min (Estimate)
                    </button>
                  )}
                </div>

                <label className="modal-field mt-3.5">
                  <span className="modal-label">Or Custom Minutes:</span>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    className="modal-input"
                    placeholder="e.g. 35"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5 border-t border-line pt-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartTimer}
                icon={<Play size={16} fill="currentColor" />}
              >
                Start Live Timer
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <label className="modal-field">
              <span className="modal-label">
                Actual Effort Completed (in Minutes) <span className="required">*</span>
              </span>
              <input
                type="number"
                min="0"
                max="1440"
                className="modal-input"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <span className="field-hint">
                {manualMinutes >= 60
                  ? `Equivalent to ${Math.floor(manualMinutes / 60)}h ${manualMinutes % 60}m`
                  : `${manualMinutes} minutes`}
              </span>
            </label>

            <label className="modal-field">
              <span className="modal-label">
                Delay Explanation or Notes <span className="optional">(Optional)</span>
              </span>
              <textarea
                className="modal-input modal-textarea"
                rows={3}
                placeholder="Explain any roadblocks, dependencies, or summary of work done..."
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={markComplete}
                onChange={(e) => setMarkComplete(e.target.checked)}
              />
              <span>Mark task item as COMPLETED</span>
            </label>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-line pt-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveManualTime}
                icon={<CheckCircle2 size={16} />}
              >
                Save Effort & Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
