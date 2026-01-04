import React from 'react';

export default function ProgressBar({ items = [], goal = 2000, rmr = 2000 }) {
    const foodConsumed = items
        .filter(item => item.type === 'FOOD')
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0);

    const exerciseBurned = items
        .filter(item => item.type === 'EXERCISE')
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0);

    // netCalories can be negative if lots of exercise, clamp visual to 0 for bar usually, 
    // but logic below handles max(0, ...)
    const netCalories = foodConsumed + exerciseBurned;

    // Visual Scale Logic
    // The bar represents the range from 0 to Scale.
    // Scale is usually RMR.
    // However, if Net Calories > RMR, the bar rescales so that Net Calories fits inside.
    // We want the bar to be "Full" at RMR normally. So standard scale = RMR.
    // If net > RMR, scale = net.
    const totalScale = Math.max(rmr, netCalories);
    const safeScale = totalScale > 0 ? totalScale : 1; // Prevent div by 0

    // Segment 1: Green (0 -> Goal)
    // Width is determined by how much "Green Zone" is filled.
    // Green Zone is filled up to min(Net, Goal).
    const greenFilled = Math.max(0, Math.min(netCalories, goal));
    const greenPct = (greenFilled / safeScale) * 100;

    // Segment 2: Yellow (Goal -> RMR)
    // This zone exists between Goal and RMR.
    // It is filled if Net > Goal.
    // Filled amount = min(Net, RMR) - Goal.
    const yellowFilled = Math.max(0, Math.min(netCalories, rmr) - goal);
    const yellowPct = (yellowFilled / safeScale) * 100;

    // Segment 3: Red (RMR -> Net)
    // This zone exists beyond RMR.
    // Filled amount = Net - RMR (if Net > RMR)
    const redFilled = Math.max(0, netCalories - rmr);
    const redPct = (redFilled / safeScale) * 100;

    // Goal Marker Position
    // The goal is always at 'goal' value.
    const goalMarkerPct = (goal / safeScale) * 100;

    return (
        <div className="rounded-lg bg-white dark:bg-card-dark px-3 py-2 shadow-sm border border-gray-200 dark:border-border-dark flex items-center gap-3 h-10">
            <div className="flex-shrink-0 text-slate-900 dark:text-white text-xs font-bold w-16">
                {netCalories.toLocaleString('en-US')} <span className="text-[10px] font-normal text-slate-500 dark:text-gray-400">kcal</span>
            </div>

            <div className="flex-grow relative h-2">
                {/* Background Track (representing Scale) - Optional visual aid, or just rely on empty space */}
                <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-input-bg-dark overflow-hidden flex">
                    {/* Segments */}
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${greenPct}%` }}
                    />
                    <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${yellowPct}%` }}
                    />
                    <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${redPct}%` }}
                    />
                </div>

                {/* Goal Marker */}
                {/* Only show if goal is within scale (it should always be since scale >= rmr >= goal) */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 pointer-events-none"
                    style={{ left: `${goalMarkerPct}%` }}
                ></div>

                {/* Goal Label - conditionally positioned to not clip? 
                    For now, center it on the marker line, slightly above or below. 
                    Let's place it above the bar for clarity, or maybe tooltippy? 
                    User asked: "mark the position of the goal and show the goal label there" 
                */}
                <div
                    className="absolute -top-3 text-[9px] font-bold text-slate-500 dark:text-gray-400 transform -translate-x-1/2"
                    style={{ left: `${goalMarkerPct}%` }}
                >
                    GOAL
                </div>

                {/* RMR Marker? User didn't explicitly ask for RMR label, just color change after RMR. 
                     But since the scale changes, maybe useful? 
                     User said: "The progress bar should be full when the calorie amount reaches the total RMR." 
                     So normally, RMR is at 100%. 
                */}
            </div>
        </div>
    );
}
