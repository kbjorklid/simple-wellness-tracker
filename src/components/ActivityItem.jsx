import React, { useState } from 'react';
import WellnessInput from './WellnessInput';
import ItemMeasurementInputs from './ItemMeasurementInputs';

export default function ActivityItem({ item, isInLibrary, onDelete, onUpdate, onSaveToLibrary }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(item);
    const descriptionRef = React.useRef(null);

    // Sync draft with item when not editing or when item changes externally
    React.useEffect(() => {
        if (!isEditing) {
            setDraft(item);
        }
    }, [item, isEditing]);

    const handleSave = () => {
        if (draft.name !== item.name || draft.type !== item.type || draft.calories !== item.calories || draft.description !== item.description || draft.minutes !== item.minutes || draft.count !== item.count) {
            onUpdate(item.id, draft);
        }
        setIsEditing(false);
        if (!draft.description) {
            setIsExpanded(false);
        }
    };

    const handleCancel = () => {
        setDraft(item);
        setIsEditing(false);
        if (!item.description) {
            setIsExpanded(false);
        }
    };

    const handleEditStart = () => {
        setIsEditing(true);
        setIsExpanded(true);
    };

    const handleChange = (field, value) => {
        setDraft(prev => ({ ...prev, [field]: value }));
    };

    const handleCountChange = (delta) => {
        const currentCount = item.count || 1;
        const newCount = Math.max(1, currentCount + delta);
        if (newCount !== currentCount) {
            onUpdate(item.id, { ...item, count: newCount });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Icon mapping based on type
    const icon = draft.type === 'FOOD' ? 'restaurant' : 'directions_run';
    const typeColor = draft.type === 'EXERCISE' ? 'text-orange-500' : 'text-emerald-500';
    const typeBg = draft.type === 'EXERCISE' ? 'bg-orange-500/5 dark:bg-orange-400/5' : 'hover:bg-gray-50 dark:hover:bg-white/5';
    const hasDescription = !!item.description;

    const count = item.count || 1;
    const totalCalories = (item.calories || 0) * count;

    const bookmarkIcon = isInLibrary ? 'bookmark' : 'bookmark_add';
    const bookmarkColor = isInLibrary
        ? 'text-primary'
        : 'text-slate-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary';
    const bookmarkTitle = isInLibrary ? "In Library (Click to Replace)" : "Save to Library";

    return (
        <div className={`group ${typeBg} transition-colors border-b border-gray-100 dark:border-border-dark last:border-0`}>
            {/* Adjusted grid to give space for buttons */}
            <div className="grid grid-cols-[20px_60px_48px_1fr_160px_60px] gap-3 px-3 py-1.5 items-center">
                {/* Expand Toggle - Only visible if has description */}
                <div className="flex items-center justify-center">
                    {(hasDescription || isEditing) && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-center text-slate-300 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">{isExpanded ? 'expand_more' : 'chevron_right'}</span>
                        </button>
                    )}
                </div>

                {/* Count Controls */}
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => handleCountChange(-1)}
                        className="text-slate-400 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                        disabled={count <= 1}
                    >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300 w-4 text-center">{count}</span>
                    <button
                        onClick={() => handleCountChange(1)}
                        className="text-slate-400 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                </div>

                {/* Icon (merged with Type) */}
                <button
                    onClick={() => {
                        if (isEditing) {
                            handleChange('type', draft.type === 'FOOD' ? 'EXERCISE' : 'FOOD');
                        }
                    }}
                    disabled={!isEditing}
                    className={`size-8 rounded flex items-center justify-center ${typeColor} transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    title={isEditing ? "Click to toggle type" : item.type}
                >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>

                {/* Name */}
                <div className="text-slate-900 dark:text-white font-medium text-sm w-full">
                    {isEditing ? (
                        <WellnessInput
                            type="text"
                            value={draft.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus={!shouldAutoFocusDescription}
                            placeholder="Item name"
                        />
                    ) : (
                        <div className="truncate">
                            {item.name}
                        </div>
                    )}
                </div>

                {/* Calories Input & Minutes (if exercise) */}
                <div className={`text-right font-bold text-sm flex flex-col items-end ${draft.type === 'EXERCISE' ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                    {isEditing ? (
                        <div className="flex flex-col items-end gap-1 w-full relative">
                            <ItemMeasurementInputs
                                type={draft.type}
                                minutes={draft.minutes}
                                calories={draft.calories}
                                onChange={(updates) => setDraft(prev => ({ ...prev, ...updates }))}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            {item.type === 'EXERCISE' && item.minutes > 0 && (
                                <span className="text-[10px] text-slate-400 font-medium mb-0.5">{(item.minutes || 0) * count}m</span>
                            )}
                            <span>{totalCalories}</span>
                        </div>
                    )}
                </div>

                {/* Actions: Edit & Delete */}
                <div className="flex items-center justify-end gap-1">
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => onSaveToLibrary(item)}
                                className={`flex items-center justify-center ${bookmarkColor} transition-colors size-7 rounded`}
                                title={bookmarkTitle}
                            >
                                <span className="material-symbols-outlined text-[18px]">{bookmarkIcon}</span>
                            </button>
                            <button
                                onClick={handleEditStart}
                                className="flex items-center justify-center text-slate-300 hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400 transition-colors size-7 rounded"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onDelete(item.id)}
                        className="flex items-center justify-center text-slate-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors size-7 rounded"
                        title="Delete"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>

            {/* Description Area - Visible if expanded */}
            {isExpanded && (
                <div className="px-3 pb-3 pt-2 flex gap-3">
                    <div className="w-[148px] shrink-0"></div>
                    <div className="relative w-full flex flex-col gap-2 col-span-4">
                        <div className="relative w-full">
                            <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-card-dark text-[9px] font-bold text-primary uppercase tracking-wide leading-none z-10">Description</label>
                            {isEditing ? (
                                <textarea
                                    ref={descriptionRef}
                                    value={draft.description || ""}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="bg-gray-50 dark:bg-input-bg-dark border border-primary text-slate-600 dark:text-gray-300 font-medium text-xs rounded-md px-3 py-2 w-full shadow-sm focus:outline-none min-h-[60px]"
                                    placeholder="Add a description..."
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-input-bg-dark border border-primary text-slate-600 dark:text-gray-300 font-medium text-xs rounded-md px-3 py-2 w-full shadow-sm min-h-[40px]">
                                    {item.description}
                                </div>
                            )}
                        </div>

                        {/* Save Actions */}
                        {isEditing && (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1 text-xs font-bold text-white bg-primary rounded hover:bg-primary-dark transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
