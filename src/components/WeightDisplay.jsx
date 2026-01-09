import React, { useState } from 'react';
import WellnessInput from './WellnessInput';

export default function WeightDisplay({ weight, onSave, unit = 'kg' }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const handleSave = () => {
        const val = parseFloat(editValue);
        if (!isNaN(val)) {
            onSave(val);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const startEditing = () => {
        setEditValue(weight ? weight.toString() : '');
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <div className="w-24">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                </form>
            </div>
        );
    }

    return (
        <button
            className="group flex flex-col items-end gap-0.5 cursor-pointer text-right min-w-[60px]"
            onClick={startEditing}
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
