"use client";

import { useTaskContext } from "@/lib/tasks/task-context";
import { Pause, Play, Square } from "lucide-react";

export function ActiveTimerBanner() {
  const { activeTimer, pauseTimer, resumeTimer, stopTimer } = useTaskContext();

  if (!activeTimer) return null;

  const elapsedSeconds = Math.floor(activeTimer.elapsedSeconds);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  const estimatedMin = activeTimer.estimatedTimeMin ?? 0;
  const progressPercent =
    estimatedMin > 0
      ? Math.min(100, Math.round((elapsedMinutes / estimatedMin) * 100))
      : Math.min(100, (elapsedSeconds % 3600) / 36);
  const isOvertime = estimatedMin > 0 && elapsedMinutes > estimatedMin;

  return (
    <div
      className={`relative mb-5.5 overflow-hidden rounded-xl border border-white/10 p-5 text-white shadow-xl transition-colors sm:p-6 ${
        isOvertime
          ? "bg-gradient-to-br from-[#3d2238] to-[#201323]"
          : "bg-gradient-to-br from-[#2a254c] to-[#1a1636]"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(144,125,247,0.25)_0%,rgba(144,125,247,0)_70%)]" />

      <div className="relative z-1 flex flex-wrap items-center justify-between gap-6">
        <div className="min-w-[260px] flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/20 px-2 py-0.5 text-[11px] font-bold tracking-wider text-success-border">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-success ${
                  activeTimer.isRunning ? "animate-pulse" : ""
                }`}
              />
              {activeTimer.isRunning ? "TRACKING ACTIVE" : "TIMER PAUSED"}
            </span>
            <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[11px] font-semibold text-[#c7bcff]">
              {activeTimer.projectName}
            </span>
          </div>

          <h3 className="m-0 text-lg font-bold tracking-tight text-white">
            {activeTimer.itemDescription}
          </h3>
          <p className="m-0 mt-1.5 text-xs text-[#ada9c9]">
            Task: <strong className="text-[#e2dff8]">{activeTimer.taskName}</strong>
            {estimatedMin > 0 && (
              <span className="ml-1.5 text-[#a8a3c8]">
                · Estimate: {estimatedMin}m · Tracked: {elapsedMinutes}m
                {isOvertime && (
                  <span className="font-semibold text-danger-border">
                    {" "}
                    (+{elapsedMinutes - estimatedMin}m over estimate)
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="text-left sm:text-right">
            <div className="font-mono text-3xl font-extrabold leading-none tracking-tight text-white sm:text-4xl">
              {formattedTime}
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#8b85af]">
              total tracked
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTimer.isRunning ? (
              <button
                type="button"
                className="inline-flex h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-warning px-3.5 text-xs font-semibold text-white transition-all hover:bg-warning-hover"
                onClick={pauseTimer}
                title="Pause timer"
              >
                <Pause size={17} strokeWidth={2.4} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-success px-3.5 text-xs font-semibold text-white transition-all hover:bg-success-hover"
                onClick={resumeTimer}
                title="Resume timer"
              >
                <Play size={17} strokeWidth={2.4} />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              className="inline-flex h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/15 px-3.5 text-xs font-semibold text-white transition-all hover:bg-white/25"
              onClick={stopTimer}
              title="Stop timer and save tracked time"
            >
              <Square size={15} strokeWidth={2.4} />
              <span>Stop &amp; Save</span>
            </button>
          </div>
        </div>
      </div>

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
  );
}
