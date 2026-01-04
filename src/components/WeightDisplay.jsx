import React, { useState, useEffect } from 'react';
import WellnessInput from './WellnessInput';

export default function WeightDisplay({ weight, onSave, unit = 'kg' }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (!isEditing) {
            setEditValue(weight ? weight.toString() : '');
        }
    }, [weight, isEditing]);

    const handleSave = () => {
        const val = parseFloat(editValue);
        if (!isNaN(val)) {
            onSave(val);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(weight ? weight.toString() : '');
        }
    };

    if (isEditing) {
        return (
            <div className="w-24">
                <WellnessInput
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    placeholder="Weight"
                    suffix={unit}
                />
            </div>
        );
    }

    return (
        <button
            className="group flex flex-col items-end gap-0.5 cursor-pointer text-right min-w-[60px]"
            onClick={() => setIsEditing(true)}
            title="Click to edit weight"
        >
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500 flex items-center gap-1">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity material-symbols-outlined text-[12px]">edit</span>
                Weight
            </p>
            <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-none">
                {weight ? weight : '--'} <span className="text-sm font-normal text-slate-500">{unit}</span>
            </p>
        </button>
    );
}
