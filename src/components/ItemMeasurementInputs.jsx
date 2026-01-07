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
    // Initialize link state and ratio
    const ratioRef = React.useRef(null);

    const [isLinked, setIsLinked] = useState(() => {
        // Default to linked only if it's EXERCISE and has valid values to form a ratio
        // Use Math.abs for calories check as they are negative for EXERCISE
        const shouldLink = type === 'EXERCISE' && minutes > 0 && Math.abs(calories) > 0;
        if (shouldLink) {
            return true;
        }
        return false;
    });

    // Update ratio when linking
    useEffect(() => {
        if (isLinked) {
            if (minutes > 0 && Math.abs(calories) > 0) {
                // Capture ratio if valid values exist
                ratioRef.current = calories / minutes;
            } else {
                ratioRef.current = (minutes > 0 && Math.abs(calories) > 0) ? calories / minutes : null;
            }
        }
    }, [isLinked]); // Only re-calc on link toggle, NOT on every prop change (that would be unstable)

    // Re-evaluate link possibility on type change (if switching to FOOD, unlink)
    useEffect(() => {
        if (type === 'FOOD') {
            setIsLinked(false);
        }
        else if (type === 'EXERCISE' && minutes > 0 && Math.abs(calories) > 0 && !isLinked) {
            // Only auto-link if switching type. If existing, respect current state?
            // Actually my logic before was "re-evaluate".
            // If I am editing an item that WAS Food, and I switch to Exercise, it should probably link?
            setIsLinked(true);
            ratioRef.current = calories / minutes;
        }
    }, [type]);


    const handleMinutesChange = (newMinutes) => {
        let updates = { minutes: newMinutes };

        if (isLinked && ratioRef.current !== null && newMinutes > 0) {
            updates.calories = Math.round(newMinutes * ratioRef.current);
        }
        onChange(updates);
    };

    const handleCaloriesChange = (newCalories) => {
        let updates = { calories: newCalories };

        if (isLinked && ratioRef.current !== null && Math.abs(newCalories) > 0) {
            // Ensure minutes are positive
            updates.minutes = Math.abs(Math.round(newCalories / ratioRef.current));
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
