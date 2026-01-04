import React, { useState, useEffect } from 'react';
import WellnessInput from './WellnessInput';

export default function ItemMeasurementInputs({
    type,
    minutes,
    calories,
    onChange,
    onKeyDown,
    className = ''
}) {
    const [isLinked, setIsLinked] = useState(type === 'EXERCISE');

    // If type changes to FOOD, unlink; if EXERCISE, default link (or keep user preference? Let's default link for now to match behavior)
    useEffect(() => {
        if (type === 'FOOD') {
            setIsLinked(false);
        } else {
            setIsLinked(true);
        }
    }, [type]);

    const handleMinutesChange = (newMinutes) => {
        let updates = { minutes: newMinutes };

        if (isLinked && minutes > 0 && calories > 0) {
            const ratio = calories / minutes;
            updates.calories = Math.round(newMinutes * ratio);
        }
        onChange(updates);
    };

    const handleCaloriesChange = (newCalories) => {
        let updates = { calories: newCalories };

        if (isLinked && minutes > 0 && calories > 0) {
            const ratio = minutes / calories;
            updates.minutes = Math.round(newCalories * ratio);
        }
        onChange(updates);
    };

    if (type !== 'EXERCISE') {
        return (
            <WellnessInput
                type="number"
                value={calories || ''}
                onChange={(e) => onChange({ calories: parseInt(e.target.value) || 0 })}
                onKeyDown={onKeyDown}
                className={`w-full ${className}`}
                suffix="cal"
                aria-label="Calories"
            />
        );
    }

    return (
        <div className={`flex items-center justify-end gap-1 w-full ${className}`}>
            <WellnessInput
                type="number"
                value={minutes || ''}
                onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                onKeyDown={onKeyDown}
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
                value={calories || ''}
                onChange={(e) => handleCaloriesChange(parseInt(e.target.value) || 0)}
                onKeyDown={onKeyDown}
                className="w-[70px]"
                placeholder="0"
                suffix="cal"
                aria-label="Calories"
            />
        </div>
    );
}
