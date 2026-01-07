import React, { useState } from 'react';
import WellnessInput from './WellnessInput';

export default function QuickAdd({ onAdd }) {
    const [minutes, setMinutes] = useState('');
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [type, setType] = useState('FOOD'); // FOOD or EXERCISE
    const [isLinked, setIsLinked] = useState(false);
    const ratioRef = React.useRef(null);

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
        ratioRef.current = null;
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

    const toggleLink = () => {
        const shouldLink = !isLinked;
        setIsLinked(shouldLink);

        if (shouldLink) {
            const m = parseInt(minutes) || 0;
            const c = parseInt(calories) || 0;
            if (m > 0 && c > 0) {
                ratioRef.current = c / m;
            } else {
                ratioRef.current = null;
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') handleCancel();
    };

    return (

        <div className="flex flex-col md:grid md:grid-cols-[20px_60px_48px_1fr_240px_60px] gap-3 px-3 py-3 md:py-1.5 items-center bg-gray-50/50 dark:bg-input-bg-dark/30 border-t border-dashed border-gray-200 dark:border-border-dark opacity-100 transition-opacity">
            {/* Desktop Spacers */}
            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>

            {/* Mobile: Top Row with Icon/Type and Name */}
            <div className="flex w-full items-center gap-2 md:contents">
                {/* Icon / Type Toggle */}
                <button
                    className={`size-8 shrink-0 rounded flex items-center justify-center transition-colors ${type === 'EXERCISE' ? 'text-primary bg-primary/5 dark:bg-primary/5' : 'text-slate-300 dark:text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}`}
                    onClick={toggleType}
                    title={`Current type: ${type}. Click to toggle.`}
                >
                    <span className="material-symbols-outlined text-[20px] md:text-[18px]">{type === 'FOOD' ? 'restaurant' : 'directions_run'}</span>
                </button>

                {/* Name Input */}
                <div className="flex-1 min-w-0">
                    <WellnessInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Quick add item..."
                        className="w-full"
                    />
                </div>
            </div>

            {/* Mobile: Bottom Row with Measurements and Actions */}
            <div className="flex w-full items-center justify-between gap-2 md:contents">
                {/* Desktop logic expects this to be just the inputs column, so we might need a wrapper for mobile 
                    that isn't `contents` on mobile but IS `contents` on desktop? 
                    Actually, `md:contents` on the wrappers above was clever but tricky.
                    
                    Let's use `md:contents` again. 
                    Structure:
                    Mobile Wrapper [ Inputs + Actions ] -> Desktop: Inputs(Col 5), Actions(Col 6)
                 */}

                {/* Measurements Input Area */}
                <div className="flex-1 md:flex-none relative flex items-center justify-end w-full md:w-auto">
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
                                        if (minVal > 0 && ratioRef.current !== null) {
                                            setCalories(Math.round(minVal * ratioRef.current).toString());
                                        }
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-[85px] shrink-0"
                                placeholder="0"
                                suffix="min"
                                aria-label="Minutes"
                            />
                            <button
                                onClick={toggleLink}
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
                                        if (calVal > 0 && ratioRef.current !== null) {
                                            setMinutes(Math.round(calVal / ratioRef.current).toString());
                                        }
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-[85px] shrink-0"
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

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 shrink-0 ml-2 md:ml-0">
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
        </div>
    );
}
