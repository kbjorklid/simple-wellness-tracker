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
        if (type === 'EXERCISE' && minutes > 0 && calories > 0) {
            return true;
        }
        return false;
    });

    // Update ratio when linking
    useEffect(() => {
        if (isLinked) {
            if (minutes > 0 && calories > 0) {
                // Capture ratio if valid values exist
                ratioRef.current = calories / minutes;
            } else {
                // If linking with zero values, we can't establish a ratio yet. 
                // We'll wait until values are entered? 
                // Actually, if they link with 0s, and then type minutes=10, we have no ratio.
                // Standard behavior: Link implies a ratio exists or will be established.
                // If 0/0, maybe we don't set ratio yet.
                // If they type minutes=10, do we update calories? No ratio.
                // So maybe we can't link 0/0? 
                // Or we accept it, but don't auto-update until we have a ratio.
                // BUT: User requirement: "new item... unlinked state... user can enter initial values".
                // So they enter 10m, 33cal. Then Link. Now we have ratio.
                ratioRef.current = (minutes > 0 && calories > 0) ? calories / minutes : null;
            }
        }
    }, [isLinked]); // Only re-calc on link toggle, NOT on every prop change (that would be unstable)

    // Re-evaluate link possibility on type change (if switching to FOOD, unlink)
    useEffect(() => {
        if (type === 'FOOD') {
            setIsLinked(false);
        }
        // If switching back to EXERCISE, do we re-link? 
        // Best to match 'isLinked' default logic or stay unlink?
        // Let's stay unlinked to be safe unless we want to persist user preference.
        // Current logic was: if switch to EXERCISE, default link. 
        // Let's keep existing logic but respect value check:
        else if (type === 'EXERCISE' && minutes > 0 && calories > 0) {
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

        if (isLinked && ratioRef.current !== null && newCalories > 0) {
            updates.minutes = Math.round(newCalories / ratioRef.current);
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
