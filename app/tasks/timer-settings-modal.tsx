"use client";

import React, { useState } from "react";
import type { Task, TaskItem } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { Timer, Clock, Play, CheckCircle2 } from "lucide-react";

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
    item.estimatedTimeMin ?? 25
  );
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [timerMode, setTimerMode] = useState<"countdown" | "stopwatch">("countdown");

  // Manual tab state
  const [manualMinutes, setManualMinutes] = useState<number>(
    item.actualEffortMin ?? item.estimatedTimeMin ?? 30
  );
  const [manualNote, setManualNote] = useState<string>(item.note ?? "");
  const [markComplete, setMarkComplete] = useState<boolean>(
    item.status === "COMPLETED"
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Timer & Effort Tracker</h2>
            <p className="modal-subtitle">{item.description}</p>
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

        <div className="flex border-b border-line px-6 bg-canvas/30">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 py-3 px-4 border-0 bg-transparent text-xs font-semibold cursor-pointer relative transition-colors ${
              activeTab === "timer"
                ? "text-purple border-b-2 border-b-purple"
                : "text-muted hover:text-ink"
            }`}
            onClick={() => setActiveTab("timer")}
          >
            <Timer size={15} />
            <span>Live Timer</span>
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 py-3 px-4 border-0 bg-transparent text-xs font-semibold cursor-pointer relative transition-colors ${
              activeTab === "manual"
                ? "text-purple border-b-2 border-b-purple"
                : "text-muted hover:text-ink"
            }`}
            onClick={() => setActiveTab("manual")}
          >
            <Clock size={15} />
            <span>Manual Log / Note</span>
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "timer" ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4.5">
                <label
                  className={`flex items-start gap-2.5 p-3 border rounded-lg bg-card cursor-pointer transition-all ${
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
                    <p className="m-0 mt-0.5 text-[11px] text-muted leading-snug">Focus timer that notifies you when target effort is reached</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 border rounded-lg bg-card cursor-pointer transition-all ${
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
                    <p className="m-0 mt-0.5 text-[11px] text-muted leading-snug">Counts up continuously until you pause or stop</p>
                  </div>
                </label>
              </div>

              {timerMode === "countdown" && (
                <div>
                  <span className="modal-label">Choose Target Duration:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {presets.map((min) => (
                      <button
                        key={min}
                        type="button"
                        className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          selectedPreset === min && !customMinutes
                            ? "border-purple bg-purple-subtle text-purple font-bold"
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
                        className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          selectedPreset === item.estimatedTimeMin && !customMinutes
                            ? "border-purple bg-purple-subtle text-purple font-bold"
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

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartTimer}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Start Live Timer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="manual-tab-content">
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

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveManualTime}
                >
                  <CheckCircle2 size={16} />
                  <span>Save Effort & Notes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
