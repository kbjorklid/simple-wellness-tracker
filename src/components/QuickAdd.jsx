import React, { useState } from 'react';
import WellnessInput from './WellnessInput';

export default function QuickAdd({ onAdd }) {
    const [minutes, setMinutes] = useState('');
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [type, setType] = useState('FOOD'); // FOOD or EXERCISE
    const [isLinked, setIsLinked] = useState(false);

    const isValid = name.trim().length > 0 && calories !== '';

    const handleAdd = () => {
        if (!isValid) return;

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

        handleCancel();
    };

    const handleCancel = () => {
        setName('');
        setCalories('');
        setMinutes('');
        setIsLinked(false);
        setType('FOOD');
    };

    const toggleType = () => {
        if (type === 'FOOD') {
            setType('EXERCISE');
            if (!minutes) setMinutes('30');
        } else {
            setType('FOOD');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') handleCancel();
    };

    return (
        <div className="grid grid-cols-[20px_60px_48px_1fr_160px_60px] gap-3 px-3 py-1.5 items-center bg-gray-50/50 dark:bg-input-bg-dark/30 border-t border-dashed border-gray-200 dark:border-border-dark opacity-100 transition-opacity">
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
            <WellnessInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Quick add item..."
            />
            {/* Inputs - No separate Type button anymore */}
            <div className="relative flex items-center justify-end w-full">
                {type === 'EXERCISE' ? (
                    <div className="flex items-center justify-end gap-1 w-full">
                        <WellnessInput
                            type="number"
                            value={minutes}
                            onChange={(e) => {
                                const newMinutes = e.target.value;
                                setMinutes(newMinutes);

                                if (isLinked) {
                                    const minVal = parseInt(newMinutes) || 0;
                                    // Use current state for ratio calculation
                                    const currentMin = parseInt(minutes) || 0;
                                    const currentCal = parseInt(calories) || 0;

                                    if (currentMin > 0 && currentCal > 0 && minVal > 0) {
                                        const ratio = currentCal / currentMin;
                                        setCalories(Math.round(minVal * ratio).toString());
                                    }
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-[60px]"
                            placeholder="0"
                            suffix="min"
                            aria-label="Minutes"
                        />
                        <button
                            onClick={() => setIsLinked(!isLinked)}
                            className={`size-6 flex items-center justify-center rounded transition-colors shrink-0 ${isLinked ? 'text-primary bg-primary/10' : 'text-slate-300 hover:text-slate-400'}`}
                            title={isLinked ? "Unlink (edit separately)" : "Link (edit proportionally)"}
                        >
                            <span className="material-symbols-outlined text-[16px]">{isLinked ? 'link' : 'link_off'}</span>
                        </button>
                        <WellnessInput
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
                            className="w-[70px]"
                            placeholder="0"
                            suffix="cal"
                            aria-label="Calories"
                        />
                    </div>
                ) : (
                    <WellnessInput
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full"
                        placeholder="0"
                        suffix="cal"
                        aria-label="Calories"
                    />
                )}
            </div>
            <div className="flex items-center justify-end gap-1">
                {(name || calories || minutes) && (
                    <button
                        onClick={handleCancel}
                        className="flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors size-8 rounded"
                        title="Cancel"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                )}
                <button
                    onClick={handleAdd}
                    disabled={!isValid}
                    className={`flex items-center justify-center transition-colors size-8 rounded ${!isValid ? 'text-slate-300 cursor-not-allowed' : 'text-primary hover:text-primary-hover'}`}
                    title={isValid ? "Save" : "Enter name and calories to save"}
                >
                    <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
            </div>
        </div>
    );
}
