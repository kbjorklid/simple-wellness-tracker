import React from 'react';

export default function Stats({ items = [], goal = 2000, rmr = 2000 }) {
    const foodConsumed = items
        .filter(item => item.type === 'FOOD')
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0);

    const exerciseItems = items.filter(item => item.type === 'EXERCISE');

    // Exercise calories (usually negative)
    const exerciseDirectBurn = exerciseItems
        .reduce((acc, item) => acc + (item.calories * (item.count || 1)), 0);

    // RMR deduction: (minutes / 1440) * rmr
    // This amount should be ADDED to the negative burn (making it less negative / deduction from credit)
    // OR, we can think of it as:
    // We CREDIT the user with (Full RMR) + (Exercise Burn).
    // But for the time they were exercising, they shouldn't get RMR credit.
    // So we subtract (Exercise Minutes * RMR/min) from the Total Credit.
    // 
    // Let's stick to "Net Calories" approach:
    // Net Calories = Food + Exercise (negative) + RMR Adjustment (positive correction to remove double counting?)
    // Wait.
    // Normal State: User burns RMR (2000) automatically.
    // If they run for 1 hour (-500 kcal):
    // They burned 500 kcal in that hour.
    // BUT they would have burned (2000 / 24 = 83) kcal anyway if they sat on the couch.
    // So the NET ADDITIONAL burn is 500 - 83 = 417.
    //
    // Current Logic:
    // Goal (Available) = RMR - Deficit.
    // Calories Left = Goal - NetCalories.
    // Net Calories = Food + Exercise.
    // If Food=0, Exercise=-500. Net = -500.
    // Left = 2000 - (-500) = 2500. User can eat 2500.
    //
    // WITH RMR DEDUCTION:
    // We want "Left" to be 2000 - (-417) = 2417.
    // So Net Calories should be -417.
    // Net Calories = Exercise(-500) + RMR_during_exercise(83).
    // -500 + 83 = -417.
    //
    // Logic:
    // rmrDeduction = (totalMinutes / 1440) * rmr.
    // totalBurned = exerciseDirectBurn + rmrDeduction (add positive to negative).

    const totalExerciseMinutes = exerciseItems
        .reduce((acc, item) => acc + ((item.minutes || 0) * (item.count || 1)), 0);

    const rmrDeduction = (totalExerciseMinutes / 1440) * rmr;

    const totalBurned = exerciseDirectBurn + Math.round(rmrDeduction);
    const netCalories = foodConsumed + totalBurned;
    const caloriesLeft = goal - netCalories;

    return (
        <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col justify-center gap-0.5 rounded-lg px-3 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500">Goal</p>
                <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-none">{goal}</p>
            </div>
            <div className="flex flex-col justify-center gap-0.5 rounded-lg px-3 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500">Food</p>
                <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-none">{foodConsumed}</p>
            </div>
            <div className="flex flex-col justify-center gap-0.5 rounded-lg px-3 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500">Burned</p>
                <p className="text-primary tracking-tight text-lg font-bold leading-none">{totalBurned}</p>
            </div>
            {caloriesLeft < 0 ? (
                <div className="flex flex-col justify-center gap-0.5 rounded-lg px-3 py-2 bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Over</p>
                    <p className="text-red-700 dark:text-red-300 tracking-tight text-lg font-bold leading-none">{Math.abs(caloriesLeft)}</p>
                </div>
            ) : (
                <div className="flex flex-col justify-center gap-0.5 rounded-lg px-3 py-2 bg-primary/10 border border-primary/20 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-primary-dark dark:text-primary">Left</p>
                    <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-none">{caloriesLeft}</p>
                </div>
            )}
        </div>
    );
}
