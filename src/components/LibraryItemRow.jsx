import React, { useState, useEffect } from 'react';
import WellnessInput from './WellnessInput';
import ItemMeasurementInputs from './ItemMeasurementInputs';

export default function LibraryItemRow({
    item,
    isSelected,
    currentCount,
    currentMinutes,
    onSelect,
    onAdjust,
    onUpdate,
    onDelete,
    onCreate,
    initialEditing = false
}) {
    const [isEditing, setIsEditing] = useState(initialEditing);
    const [draft, setDraft] = useState(item);

    useEffect(() => {
        if (!isEditing) {
            setDraft(item);
        }
    }, [item, isEditing]);

    const handleSave = () => {
        if (onCreate) {
            onCreate(draft);
            // Don't close editing immediately if valid validation fails? (not implemented yet)
            // But usually we clear draft or close row if it's a fixed "create" row?
            // For now, let parent handle reset/close.
        } else if (draft.name !== item.name || draft.type !== item.type || draft.calories !== item.calories || draft.description !== item.description || draft.minutes !== item.minutes) {
            onUpdate(item.id, draft);
            setIsEditing(false);
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (onCreate && onDelete) { // onDelete here is used as "Cancel Create" if passed for new item row? No, better use explicit onCancel
            // But wait, the original signature doesn't have onCancel.
            // Let's add onCancel to props if I want to support closing the creation row.
        }

        // Actually, let's just update the component signature to include onCancel below
        setDraft(item);
        setIsEditing(false);
        if (initialEditing && typeof onSelect === 'undefined') {
            // weak check for "isCreateRow" 
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const icon = draft.type === 'FOOD' ? 'restaurant' : 'directions_run';
    const typeColor = draft.type === 'EXERCISE' ? 'text-orange-500' : 'text-emerald-500';

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2 rounded-lg bg-[#2a2715] p-4 border border-primary/50">
                <div className="flex items-center gap-3">
                    {/* Icon / Type Toggle */}
                    <button
                        onClick={() => setDraft(prev => ({ ...prev, type: prev.type === 'FOOD' ? 'EXERCISE' : 'FOOD' }))}
                        className={`size-8 rounded flex items-center justify-center ${typeColor} bg-white/5 hover:bg-white/10 transition-colors`}
                        title="Toggle Type"
                    >
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </button>

                    {/* Name */}
                    <div className="flex-1">
                        <WellnessInput
                            type="text"
                            value={draft.name}
                            onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder="Item name"
                            className="w-full"
                        />
                    </div>

                    {/* Measurements */}
                    <div className="w-[180px]">
                        <ItemMeasurementInputs
                            type={draft.type}
                            minutes={draft.minutes}
                            calories={draft.calories}
                            onChange={(updates) => setDraft(prev => ({ ...prev, ...updates }))}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="flex gap-3">
                    <div className="w-11 shrink-0"></div> {/* Spacing to align with name start */}
                    <div className="flex-1">
                        <WellnessInput
                            type="text"
                            value={draft.description || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            placeholder="Description (optional)"
                            className="w-full text-xs"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2 border-t border-white/5 pt-2">
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 text-xs font-bold text-white bg-primary rounded hover:bg-primary-hover transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        );
    }

    // View Mode
    return (
        <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg bg-[#2a2715] p-4 transition-colors hover:bg-[#332f1a] border border-transparent hover:border-border-dark">
            <div className="flex flex-1 items-center gap-4 w-full min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(item.id, e.target.checked)}
                        className="h-5 w-5 rounded border-[#685f31] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer transition-colors"
                    />
                </div>
                <div className="flex flex-col justify-center grow min-w-0">
                    <p className="text-white text-base font-medium leading-normal truncate">{item.name}</p>
                    <div className="text-sm font-normal leading-normal flex items-center gap-2">
                        <span className={item.type === 'EXERCISE' ? 'text-[#8bc34a]' : 'text-primary'}>
                            {item.calories} kcal
                            {item.type === 'EXERCISE' && ` / ${item.minutes || 30}m`}
                        </span>
                        {item.description && <span className="text-text-secondary truncate max-w-[200px]">- {item.description}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-10 sm:ml-0">
                {/* Edit / Delete Actions */}
                <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-text-secondary hover:text-white p-1 rounded transition-colors"
                        title="Edit"
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="text-text-secondary hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>

                {item.type === 'FOOD' ? (
                    <>
                        <span className="text-xs text-text-secondary uppercase font-semibold tracking-wide hidden sm:block">Qty</span>
                        <div className="flex items-center bg-border-dark rounded-full p-1 shadow-inner">
                            <button
                                onClick={() => onAdjust(item.id, 'count', Math.max(1, currentCount - 1))}
                                className="text-white hover:text-primary transition-colors flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer disabled:opacity-50"
                                disabled={currentCount <= 1}
                            >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                            </button>
                            <input
                                type="number"
                                value={currentCount}
                                onChange={(e) => onAdjust(item.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                                className="text-white text-base font-medium w-10 p-0 text-center bg-transparent focus:outline-0 focus:ring-0 border-none appearance-none"
                                min="1"
                                step="1"
                            />
                            <button
                                onClick={() => onAdjust(item.id, 'count', currentCount + 1)}
                                className="text-white hover:text-primary transition-colors flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-xs text-text-secondary uppercase font-semibold tracking-wide hidden sm:block">Time</span>
                        <div className="flex items-center bg-border-dark rounded-lg px-3 py-1.5 shadow-inner ring-1 ring-transparent focus-within:ring-primary/50 transition-all h-[36px]">
                            <input
                                type="number"
                                value={currentMinutes}
                                onChange={(e) => onAdjust(item.id, 'minutes', Math.max(1, parseInt(e.target.value) || 1))}
                                className="text-white text-base font-medium w-10 p-0 text-right bg-transparent focus:outline-0 focus:ring-0 border-none appearance-none placeholder-text-secondary/50"
                            />
                            <span className="text-text-secondary text-sm ml-1 font-medium">min</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
