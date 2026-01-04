import React, { useState } from 'react';

export default function QuickAdd({ onAdd }) {
    const [minutes, setMinutes] = useState('');
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [type, setType] = useState('FOOD'); // FOOD or EXERCISE
    const [isLinked, setIsLinked] = useState(false);

    const handleAdd = () => {
        if (!name || calories === '') return;

        let calValue = parseInt(calories, 10);
        if (isNaN(calValue)) return;

        let minutesValue = 0;
        if (type === 'EXERCISE') {
            calValue = -Math.abs(calValue);
            minutesValue = parseInt(minutes, 10) || 0;
        } else {
            calValue = Math.abs(calValue);
        }

        onAdd({
            name,
            calories: calValue,
            type,
            minutes: minutesValue,
            description: ''
        });

        setName('');
        setCalories('');
        setMinutes(''); // Reset minutes
        setIsLinked(false);
        setType('FOOD');
    };

    const toggleType = () => {
        setType(prev => prev === 'FOOD' ? 'EXERCISE' : 'FOOD');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="grid grid-cols-[20px_60px_48px_1fr_130px_60px] gap-3 px-3 py-1.5 items-center bg-gray-50/50 dark:bg-input-bg-dark/30 border-t border-dashed border-gray-200 dark:border-border-dark opacity-100 transition-opacity">
            <div></div>
            <div></div>
            {/* Icon / Type Toggle - Merged */}
            <button
                className={`size-8 rounded flex items-center justify-center transition-colors ${type === 'EXERCISE' ? 'text-primary bg-primary/5 dark:bg-primary/5' : 'text-slate-300 dark:text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}`}
                onClick={toggleType}
                title={`Current type: ${type}. Click to toggle.`}
            >
                <span className="material-symbols-outlined text-[18px]">{type === 'FOOD' ? 'restaurant' : 'directions_run'}</span>
            </button>
            <input
                className="bg-transparent border-transparent focus:border-transparent focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 font-medium text-sm rounded px-0 py-0 w-full outline-none"
                placeholder="Quick add item..."
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {/* Removed separate Type button */}
            <div className="relative flex items-center justify-end gap-2">
                {type === 'EXERCISE' && (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center">
                            <input
                                className="bg-transparent border-transparent focus:border-transparent focus:ring-0 text-slate-500 dark:text-slate-400 font-medium text-xs text-right rounded px-0 py-0 w-12 outline-none"
                                placeholder="min"
                                type="number"
                                value={minutes}
                                onChange={(e) => {
                                    const newMinutes = e.target.value;
                                    setMinutes(newMinutes);

                                    if (isLinked) {
                                        const minVal = parseInt(newMinutes) || 0;
                                        const calVal = parseInt(calories) || 0;
                                        const oldMin = parseInt(minutes) || 0;

                                        // We need the previous valid ratio. 
                                        // Actually, react state update is async, so 'minutes' here is the old value.
                                        // But if we are typing, we might be starting from 0.
                                        // The requirement: "If linked, if you edit one value, the other value will update proportionally".
                                        // If I have 30m / 300cal. Linked. Change 30 -> 60. Ratio is 300/30 = 10. New cal = 600.
                                        // If I have empty/empty. Linked. Type 30... nothing happens to calories yet?
                                        // Or should I imply a default ratio? No, that's magic.
                                        // So proportional update only happens if we had a valid ratio.

                                        // Let's use current state values for ratio if they are valid
                                        const currentMin = parseInt(minutes) || 0;
                                        const currentCal = parseInt(calories) || 0;

                                        if (currentMin > 0 && currentCal > 0 && minVal > 0) {
                                            const ratio = currentCal / currentMin;
                                            setCalories(Math.round(minVal * ratio).toString());
                                        }
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                            />
                            <span className="text-[10px] text-slate-400 ml-0.5">m</span>
                        </div>
                        <button
                            onClick={() => setIsLinked(!isLinked)}
                            className={`size-5 flex items-center justify-center rounded transition-colors ${isLinked ? 'text-primary bg-primary/10' : 'text-slate-300 hover:text-slate-400'}`}
                            title={isLinked ? "Unlink (edit separately)" : "Link (edit proportionally)"}
                        >
                            <span className="material-symbols-outlined text-[14px]">{isLinked ? 'link' : 'link_off'}</span>
                        </button>
                    </div>
                )}
                <input
                    className="bg-transparent border-transparent focus:border-transparent focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 font-bold text-sm text-right rounded px-0 py-0 w-16 outline-none"
                    placeholder="0"
                    type="number"
                    value={calories}
                    onChange={(e) => {
                        const newCalories = e.target.value;
                        setCalories(newCalories);

                        if (type === 'EXERCISE' && isLinked) {
                            const calVal = parseInt(newCalories) || 0;
                            const currentMin = parseInt(minutes) || 0;
                            const currentCal = parseInt(calories) || 0;

                            if (currentMin > 0 && currentCal > 0 && calVal > 0) {
                                const ratio = currentMin / currentCal;
                                setMinutes(Math.round(calVal * ratio).toString());
                            }
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="flex items-center justify-end">
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center text-primary hover:text-primary-hover transition-colors size-8 rounded"
                >
                    <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
            </div>
        </div>
    );
}
