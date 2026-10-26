"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/lib/tasks/task-context";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

export function ActiveTimerBanner() {
  const {
    activeTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    extendTimer,
  } = useTaskContext();

  const [showSaveNote, setShowSaveNote] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [markCompleteOnStop, setMarkCompleteOnStop] = useState(false);

  if (!activeTimer) return null;

  const totalDisplaySeconds =
    activeTimer.mode === "countdown"
      ? activeTimer.secondsLeft
      : activeTimer.elapsedSeconds;

  const hours = Math.floor(totalDisplaySeconds / 3600);
  const minutes = Math.floor((totalDisplaySeconds % 3600) / 60);
  const seconds = totalDisplaySeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const elapsedMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));
  const estimatedMin = activeTimer.estimatedTimeMin ?? 0;

  // Percentage progress against estimated or target
  let progressPercent = 0;
  if (activeTimer.mode === "countdown" && activeTimer.initialTargetSeconds > 0) {
    progressPercent = Math.min(
      100,
      Math.round(
        ((activeTimer.initialTargetSeconds - activeTimer.secondsLeft) /
          activeTimer.initialTargetSeconds) *
          100
      )
    );
  } else if (estimatedMin > 0) {
    progressPercent = Math.min(100, Math.round((elapsedMinutes / estimatedMin) * 100));
  } else {
    progressPercent = Math.min(100, (activeTimer.elapsedSeconds % 3600) / 36);
  }

  const isOvertime = estimatedMin > 0 && elapsedMinutes > estimatedMin;

  function handleOpenStopDialog(complete = false) {
    setMarkCompleteOnStop(complete);
    setShowSaveNote(true);
  }

  function handleConfirmStop() {
    stopTimer(true, markCompleteOnStop, saveNote.trim() || undefined);
    setShowSaveNote(false);
    setSaveNote("");
  }

  function handleCancelStop() {
    setShowSaveNote(false);
    setSaveNote("");
  }

  return (
    <>
      <div
        className={`relative rounded-xl p-5 sm:p-6 mb-5.5 overflow-hidden border border-white/10 shadow-xl transition-colors text-white ${
          isOvertime
            ? "bg-gradient-to-br from-[#3d2238] to-[#201323]"
            : "bg-gradient-to-br from-[#2a254c] to-[#1a1636]"
        }`}
      >
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(144,125,247,0.25)_0%,rgba(144,125,247,0)_70%)] pointer-events-none" />

        <div className="relative z-1 flex flex-wrap items-center justify-between gap-6">
          <div className="flex-1 min-w-[260px]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/20 border border-success/40 text-success-border text-[11px] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                {activeTimer.isRunning ? "TRACKING ACTIVE" : "TIMER PAUSED"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#d1cfee] text-[11px] font-semibold">
                {activeTimer.mode === "countdown" ? "Target Countdown" : "Stopwatch Tracker"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple/20 text-[#c7bcff] text-[11px] font-semibold">
                {activeTimer.projectName}
              </span>
            </div>

            <h3 className="m-0 text-white text-lg font-bold tracking-tight">{activeTimer.itemDescription}</h3>
            <p className="m-0 mt-1.5 text-xs text-[#ada9c9]">
              Task: <strong className="text-[#e2dff8]">{activeTimer.taskName}</strong>
              {estimatedMin > 0 && (
                <span className="ml-1.5 text-[#a8a3c8]">
                  · Estimated: {estimatedMin}m · Elapsed: {elapsedMinutes}m
                  {isOvertime && (
                    <span className="text-danger-border font-semibold"> (+{elapsedMinutes - estimatedMin}m overtime)</span>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="text-left sm:text-right">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(166,148,255,0.4)] leading-none">
                {formattedTime}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#8b85af] font-bold mt-1">
                {activeTimer.mode === "countdown" ? "remaining" : "total elapsed"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTimer.isRunning ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-lg text-xs font-semibold bg-warning text-white hover:bg-warning-hover border-0 cursor-pointer transition-all"
                  onClick={pauseTimer}
                  title="Pause Timer"
                >
                  <Pause size={17} strokeWidth={2.4} />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-lg text-xs font-semibold bg-success text-white hover:bg-success-hover border-0 cursor-pointer transition-all"
                  onClick={resumeTimer}
                  title="Resume Timer"
                >
                  <Play size={17} strokeWidth={2.4} />
                  <span>Resume</span>
                </button>
              )}

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-lg text-xs font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 cursor-pointer transition-all"
                onClick={() => handleOpenStopDialog(false)}
                title="Stop and save tracked effort"
              >
                <Square size={15} strokeWidth={2.4} />
                <span>Save & Stop</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-lg text-xs font-semibold bg-purple text-white hover:bg-purple-hover border-0 cursor-pointer transition-all"
                onClick={() => handleOpenStopDialog(true)}
                title="Mark task completed and log time"
              >
                <CheckCircle size={15} strokeWidth={2.4} />
                <span>Finish Task</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="grid place-items-center h-8 px-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[#dedaf8] text-[11px] font-semibold cursor-pointer transition-all"
                  onClick={() => extendTimer(5)}
                  title="Add 5 minutes"
                >
                  +5m
                </button>
                <button
                  type="button"
                  className="grid place-items-center h-8 px-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[#dedaf8] text-[11px] font-semibold cursor-pointer transition-all"
                  onClick={() => extendTimer(15)}
                  title="Add 15 minutes"
                >
                  +15m
                </button>
                <button
                  type="button"
                  className="grid place-items-center h-8 px-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[#dedaf8] text-[11px] font-semibold cursor-pointer transition-all"
                  onClick={resetTimer}
                  title="Reset timer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full transition-all duration-300 ${
              isOvertime
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-gradient-to-r from-[#7562e9] to-[#10b981]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stop & Save Modal */}
      {showSaveNote && (
        <div className="modal-overlay" onClick={handleCancelStop}>
          <div className="modal-container max-w-[440px]!" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{markCompleteOnStop ? "Complete Task & Save Time" : "Save Tracked Time"}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={handleCancelStop}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="grid gap-2 p-3 sm:px-4 bg-[#fafafc] rounded-lg border border-[#eeedf3] mb-4">
                <div className="flex items-center justify-between text-xs text-[#69677b]">
                  <span>Tracked Effort:</span>
                  <strong className="text-[var(--ink)] font-bold">{elapsedMinutes} minutes</strong>
                </div>
                {estimatedMin > 0 && (
                  <div className="flex items-center justify-between text-xs text-[#69677b]">
                    <span>Initial Estimate:</span>
                    <strong className="text-[var(--ink)] font-bold">{estimatedMin} minutes</strong>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-[#69677b]">
                  <span>Status will be:</span>
                  <span className={`status-pill ${markCompleteOnStop ? "status-green" : "status-blue"}`}>
                    {markCompleteOnStop ? "COMPLETED" : "IN_PROGRESS"}
                  </span>
                </div>
              </div>

              <label className="modal-field">
                <span className="modal-label">
                  Delay Note / Completion Note <span className="optional">(Optional)</span>
                </span>
                <textarea
                  className="modal-input modal-textarea"
                  rows={3}
                  placeholder={
                    isOvertime
                      ? "Explain any unexpected delays or blockers..."
                      : "Add a note regarding what was accomplished..."
                  }
                  value={saveNote}
                  onChange={(e) => setSaveNote(e.target.value)}
                />
              </label>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelStop}>
                  Continue Timing
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmStop}
                >
                  Confirm & Save {elapsedMinutes}m
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
