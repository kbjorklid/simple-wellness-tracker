import React, { useState } from 'react';
import WellnessInput from './WellnessInput';
import ItemMeasurementInputs from './ItemMeasurementInputs';

export default function ActivityItem({ item, isInLibrary, onDelete, onUpdate, onSaveToLibrary, shouldAutoFocusDescription, onFocusHandled }) {
    const [isExpanded, setIsExpanded] = useState(shouldAutoFocusDescription || false);
    const [isEditing, setIsEditing] = useState(shouldAutoFocusDescription || false);
    const [draft, setDraft] = useState(item);
    const descriptionRef = React.useRef(null);

    React.useEffect(() => {
        if (shouldAutoFocusDescription && isEditing && descriptionRef.current) {
            descriptionRef.current.focus();
            if (onFocusHandled) {
                setTimeout(onFocusHandled, 50);
            }
        }
    }, [shouldAutoFocusDescription, isEditing, onFocusHandled]);

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


            <div className="flex flex-col md:grid md:grid-cols-[20px_60px_48px_1fr_240px_60px] gap-2 md:gap-3 px-3 py-3 md:py-1.5 items-start md:items-center">

                {/* 1. Expand Toggle (Desktop: Col 1) */}
                <div className="hidden md:flex items-center justify-center">
                    {(hasDescription || isEditing) && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">{isExpanded ? 'expand_more' : 'chevron_right'}</span>
                        </button>
                    )}
                </div>



                {/* 
                 WAIT. Duplicating logic is bad for maintenance (event handlers etc).
                 Let's try one more robust responsive grid approach.
                 
                 Mobile Layout: 
                 [ Icon | Name ....... | Actions ]
                 [ Spacer | Count | Spacer | Stats ]
                 
                 Desktop: 
                 [ Exp | Count | Icon | Name | Stats | Actions ]
                 
                 We can use `grid-cols-12` for mobile? Or stick to `flex flex-col`.
                 
                 Let's use `display: contents` for the "Common" elements and wrapper divs that hide/show based on breakpoint.
                 */}

                {/* 2. Count (Desktop: Col 2) */}
                <div className="hidden md:flex items-center justify-center gap-1">
                    <button onClick={() => handleCountChange(-1)} disabled={count <= 1} className="text-slate-400 hover:text-primary disabled:opacity-30">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300 w-4 text-center">{count}</span>
                    <button onClick={() => handleCountChange(1)} className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                </div>

                {/* 3. Icon (Desktop: Col 3) - Hidden on mobile because it's in the custom header? No let's reuse. */}
                <button
                    onClick={() => isEditing && handleChange('type', draft.type === 'FOOD' ? 'EXERCISE' : 'FOOD')}
                    disabled={!isEditing}
                    className={`hidden md:flex size-8 rounded items-center justify-center ${typeColor} transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    title={isEditing ? "Click to toggle type" : item.type}
                >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>

                {/* 4. Name (Desktop: Col 4) */}
                <div className="hidden md:block text-slate-900 dark:text-white font-medium text-sm w-full">
                    {isEditing ? (
                        <WellnessInput
                            value={draft.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Item name"
                        />
                    ) : (
                        <div className="truncate">{item.name}</div>
                    )}
                </div>

                {/* 5. Stats (Desktop: Col 5) */}
                <div className="hidden md:flex text-right font-bold text-sm flex-col items-end w-full">
                    {/* Desktop Measure Inputs */}
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
                            <span className={draft.type === 'EXERCISE' ? 'text-orange-500' : 'text-slate-900 dark:text-white'}>{totalCalories}</span>
                        </div>
                    )}
                </div>

                {/* 6. Actions (Desktop: Col 6) */}
                <div className="hidden md:flex items-center justify-end gap-1">
                    {!isEditing && (
                        <>
                            <button onClick={() => onSaveToLibrary(item)} className={`flex items-center justify-center ${bookmarkColor} size-7 rounded`} title={bookmarkTitle}>
                                <span className="material-symbols-outlined text-[18px]">{bookmarkIcon}</span>
                            </button>
                            <button onClick={handleEditStart} className="flex items-center justify-center text-slate-300 hover:text-blue-500 size-7 rounded" title="Edit">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </>
                    )}
                    <button onClick={() => onDelete(item.id)} className="flex items-center justify-center text-slate-300 hover:text-red-500 size-7 rounded" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>


                {/* 
                    MOBILE IMPLEMENTATION (Visible only < md)
                    We reconstruct the card view here. 
                 */}
                <div className="md:hidden flex flex-col w-full gap-3">
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <button
                            onClick={() => isEditing && handleChange('type', draft.type === 'FOOD' ? 'EXERCISE' : 'FOOD')}
                            disabled={!isEditing}
                            className={`size-9 shrink-0 rounded flex items-center justify-center ${typeColor} ${isEditing ? 'cursor-pointer' : ''} bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-border-dark`}
                            title={isEditing ? "Click to toggle type" : item.type}
                        >
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </button>

                        {/* Name Input/Display */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <WellnessInput
                                    value={draft.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Item name"
                                    className="w-full"
                                />
                            ) : (
                                <div className="text-slate-900 dark:text-white font-medium text-base truncate pr-2" onClick={() => (hasDescription || isEditing) && setIsExpanded(!isExpanded)}>
                                    {item.name}
                                    {hasDescription && <span className="inline-block ml-1 align-middle text-slate-400"><span className="material-symbols-outlined text-[14px]">description</span></span>}
                                </div>
                            )}
                        </div>


                    </div>

                    <div className="flex items-center justify-between px-2 gap-2">
                        {/* Quantity Selector (Left) */}
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1 border border-gray-100 dark:border-border-dark shrink-0">
                            <button onClick={() => handleCountChange(-1)} disabled={count <= 1} className="text-slate-400 active:text-primary disabled:opacity-30">
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300 w-3 text-center">{count}</span>
                            <button onClick={() => handleCountChange(1)} className="text-slate-400 active:text-primary">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                        </div>

                        {/* Middle Actions (Non-Editing: Library, Edit, Delete | Editing: Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => onSaveToLibrary(item)}
                                        className={`p-2 active:opacity-80 ${isInLibrary ? 'text-primary' : 'text-slate-400 active:text-primary'}`}
                                        title={bookmarkTitle}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{bookmarkIcon}</span>
                                    </button>
                                    <button onClick={handleEditStart} className="p-2 text-slate-400 active:text-blue-500" title="Edit">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 active:text-red-500" title="Delete">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 active:text-red-500" title="Delete">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* Stats (Right) - Only show when NOT editing on mobile, because editing moves inputs to next row */}
                        {!isEditing && (
                            <div className="flex items-center justify-end shrink-0">
                                <div className="flex flex-col items-end leading-none">
                                    <span className={`text-lg font-bold ${draft.type === 'EXERCISE' ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                                        {totalCalories}
                                        <span className="text-[10px] font-normal text-slate-500 ml-1">kcal</span>
                                    </span>
                                    {item.type === 'EXERCISE' && item.minutes > 0 && (
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {(item.minutes || 0) * count} min
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Editing Inputs (New Row) */}
                    {isEditing && (
                        <div className="flex items-center justify-end w-full px-2">
                            <ItemMeasurementInputs
                                type={draft.type}
                                minutes={draft.minutes}
                                calories={draft.calories}
                                onChange={(updates) => setDraft(prev => ({ ...prev, ...updates }))}
                                onKeyDown={handleKeyDown}
                                className="justify-end w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 pt-0 md:pt-2 flex gap-3">
                    <div className="hidden md:block w-[148px] shrink-0"></div>
                    <div className="relative w-full flex flex-col gap-2 col-span-4">
                        <div className="relative w-full mt-2 md:mt-0">
                            <label className="absolute -top-2 left-2 px-1 bg-white dark:bg-card-dark text-[10px] font-bold text-primary uppercase tracking-wide leading-none z-10 rounded">Description</label>
                            {isEditing ? (
                                <textarea
                                    ref={descriptionRef}
                                    value={draft.description || ""}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="bg-gray-50 dark:bg-input-bg-dark border border-primary text-slate-600 dark:text-gray-300 font-medium text-sm rounded-lg px-3 py-3 w-full shadow-sm focus:outline-none min-h-[80px]"
                                    placeholder="Add a description..."
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark text-slate-600 dark:text-gray-300 font-medium text-sm rounded-lg px-3 py-3 w-full shadow-sm min-h-[40px] whitespace-pre-wrap">
                                    {item.description}
                                </div>
                            )}
                        </div>
                        {/* Save Actions (Mobile & Desktop) */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-white/5 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                        {/* Mobile Library Save (if not editing) */}
                        {!isEditing && (
                            <div className="md:hidden flex justify-end mt-2">
                                <button
                                    onClick={() => onSaveToLibrary(item)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${isInLibrary ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{bookmarkIcon}</span>
                                    {isInLibrary ? 'Saved to Library' : 'Save to Library'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
