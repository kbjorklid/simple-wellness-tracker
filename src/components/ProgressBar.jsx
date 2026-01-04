import React from 'react';

export default function ProgressBar({ items = [], goal = 2000, rmr = 2000 }) {
    const foodConsumed = items
        .filter(item => item.type === 'FOOD')
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0);

    const exerciseBurned = items
        .filter(item => item.type === 'EXERCISE')
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0); // negative

    const netCalories = foodConsumed + exerciseBurned;

    // Determine scale (max of RMR or Net if over RMR)
    // Default scale is RMR because we want to show the 'Yellow' zone up to RMR.
    const totalScale = Math.max(rmr, netCalories);
    const safeScale = totalScale > 0 ? totalScale : 1;

    // Segment 1: Green (Up to Goal)
    const greenRaw = Math.max(0, Math.min(netCalories, goal));
    const greenPct = (greenRaw / safeScale) * 100;

    // Segment 2: Yellow (Goal to RMR)
    // Starts after Goal, ends at RMR. 
    // If net <= goal, this is 0.
    // If net > goal, we take min(net, rmr) - goal.
    const yellowRaw = Math.max(0, Math.min(netCalories, rmr) - goal);
    const yellowPct = (yellowRaw / safeScale) * 100;

    // Segment 3: Red (Over RMR)
    const redRaw = Math.max(0, netCalories - rmr);
    const redPct = (redRaw / safeScale) * 100;

    // Percentage text logic:
    // Existing logic was Percentage of Goal.
    // If we keep that:
    const percentageOfGoal = Math.round((netCalories / goal) * 100);
    const displayPercentage = Math.max(0, percentageOfGoal);

    return (
        <div className="rounded-lg bg-white dark:bg-card-dark px-3 py-2 shadow-sm border border-gray-200 dark:border-border-dark flex items-center gap-3 h-10">
            <div className="flex-shrink-0 text-slate-900 dark:text-white text-xs font-bold">Daily Progress</div>
            <div className="flex-grow rounded-full bg-gray-100 dark:bg-input-bg-dark h-1.5 w-full overflow-hidden flex">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${greenPct}%` }}
                ></div>
                <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${yellowPct}%` }}
                ></div>
                <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${redPct}%` }}
                ></div>
            </div>
            <div className="flex-shrink-0 text-slate-500 dark:text-gray-400 text-xs font-medium">{displayPercentage}%</div>
        </div>
    );
}
