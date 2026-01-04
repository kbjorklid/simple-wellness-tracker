import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function LibraryModal({ isOpen, onClose, onAdd }) {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, FOOD, EXERCISE
    const [selection, setSelection] = useState({}); // { [id]: { selected: boolean, count: number, minutes: number } }

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setFilterType('ALL');
            setSelection({});
        }
    }, [isOpen]);

    const items = useLiveQuery(
        () => {
            let collection = db.library.toCollection();

            // Apply sorting/filtering if needed, but for search/type we might need to filter in memory 
            // or use compound index. Given library size is likely small (<1000), in-memory filter is fine.
            return collection.toArray();
        },
        []
    ) || [];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'ALL' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleSelect = (id, isSelected) => {
        setSelection(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                selected: isSelected,
                count: prev[id]?.count || 1,
                minutes: prev[id]?.minutes || items.find(i => i.id === id)?.minutes || 30
            }
        }));
    };

    const handleAdjustment = (id, field, value) => {
        setSelection(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                selected: true, // Auto-select on adjustment
                [field]: value
            }
        }));
    };

    const handleAddSelected = () => {
        const selectedIds = Object.keys(selection).filter(id => selection[id]?.selected).map(Number);
        const selectedData = selectedIds.map(id => {
            const item = items.find(i => i.id === id);
            const adj = selection[id];

            // Calculate total calories based on adjustments
            let finalCalories = item.calories;

            // For Food: base calories * count
            // For Exercise: base calories (often per 30m or 1h) * (minutes / baseMinutes) ?? 
            // Simplified: The library item stores "calories" and "minutes" (default duration).
            // If we blindly treat `calories` as "calories per unit", then:
            // Food: total = item.calories * adj.count
            // Exercise: total = (item.calories / item.minutes) * adj.minutes

            let finalMinutes = 0;

            if (item.type === 'EXERCISE') {
                const baseMinutes = item.minutes || 30; // Default base if missing
                // Prevent division by zero
                const safeBase = baseMinutes > 0 ? baseMinutes : 30;
                finalMinutes = adj.minutes || safeBase;

                // If item has calories defined
                if (item.calories) {
                    const ratio = finalMinutes / safeBase;
                    finalCalories = Math.round(item.calories * ratio);
                }
            } else {
                // FOOD
                finalCalories = Math.round(item.calories * (adj.count || 1));
            }

            return {
                ...item,
                // Override with adjustments (except id)
                id: undefined, // Create new ID for log
                count: item.type === 'FOOD' ? (adj.count || 1) : 1, // Store count for food
                minutes: finalMinutes,
                calories: finalCalories,
                // We keep original description, or maybe we want to allow editing it later? 
                // For now keep original.
            };
        });

        onAdd(selectedData);
        onClose();
    };

    const selectedCount = Object.values(selection).filter(s => s.selected).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
            <div className="relative flex w-full max-w-[800px] max-h-[90vh] flex-col rounded-xl bg-[#232010] shadow-2xl ring-1 ring-border-dark overflow-hidden transition-all">

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-border-dark px-6 py-5 bg-[#232010] z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Add from Library</h2>
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                        >
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>
                    <div className="w-full">
                        <div className="flex w-full items-center rounded-lg h-12 bg-border-dark/50 ring-1 ring-transparent focus-within:ring-primary focus-within:bg-border-dark transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined text-[24px]">search</span>
                            </div>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex w-full min-w-0 flex-1 bg-transparent text-white placeholder:text-text-secondary px-2 h-full text-base font-normal focus:outline-none border-none focus:ring-0"
                                placeholder="Search food or exercise..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <FilterButton
                            active={filterType === 'ALL'}
                            onClick={() => setFilterType('ALL')}
                            label="All"
                        />
                        <FilterButton
                            active={filterType === 'FOOD'}
                            onClick={() => setFilterType('FOOD')}
                            label="Foods Only"
                        />
                        <FilterButton
                            active={filterType === 'EXERCISE'}
                            onClick={() => setFilterType('EXERCISE')}
                            label="Exercises Only"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                    <div className="flex flex-col gap-2">
                        {filteredItems.length === 0 ? (
                            <div className="text-center text-text-secondary py-8">
                                No items found in library.
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const isSelected = selection[item.id]?.selected || false;
                                const currentCount = selection[item.id]?.count || 1;
                                const currentMinutes = selection[item.id]?.minutes || item.minutes || 30;

                                return (
                                    <div key={item.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg bg-[#2a2715] p-4 transition-colors hover:bg-[#332f1a] border border-transparent hover:border-border-dark">
                                        <div className="flex flex-1 items-center gap-4 w-full">
                                            <div className="flex size-6 shrink-0 items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelect(item.id, e.target.checked)}
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
                                            {item.type === 'FOOD' ? (
                                                <>
                                                    <span className="text-xs text-text-secondary uppercase font-semibold tracking-wide hidden sm:block">Qty</span>
                                                    <div className="flex items-center bg-border-dark rounded-full p-1 shadow-inner">
                                                        <button
                                                            onClick={() => handleAdjustment(item.id, 'count', Math.max(1, currentCount - 1))}
                                                            className="text-white hover:text-primary transition-colors flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer disabled:opacity-50"
                                                            disabled={currentCount <= 1}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">remove</span>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={currentCount}
                                                            onChange={(e) => handleAdjustment(item.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="text-white text-base font-medium w-10 p-0 text-center bg-transparent focus:outline-0 focus:ring-0 border-none appearance-none"
                                                            min="1"
                                                            step="1"
                                                        />
                                                        <button
                                                            onClick={() => handleAdjustment(item.id, 'count', currentCount + 1)}
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
                                                            onChange={(e) => handleAdjustment(item.id, 'minutes', Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="text-white text-base font-medium w-10 p-0 text-right bg-transparent focus:outline-0 focus:ring-0 border-none appearance-none placeholder-text-secondary/50"
                                                        />
                                                        <span className="text-text-secondary text-sm ml-1 font-medium">min</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between border-t border-border-dark bg-[#1e1c0e] px-6 py-4 shrink-0 gap-4">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto text-text-secondary hover:text-white font-medium px-4 py-2 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="hidden sm:inline-block text-sm text-text-secondary">
                            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={handleAddSelected}
                            disabled={selectedCount === 0}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-[#221f10] text-base font-bold leading-normal px-8 py-3 rounded-lg shadow-lg shadow-yellow-900/20 transition-all hover:translate-y-[-1px] active:translate-y-0"
                        >
                            Add Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active
                    ? 'font-bold bg-primary text-[#221f10] shadow-sm hover:bg-primary-hover'
                    : 'text-text-secondary border border-border-dark hover:border-primary hover:text-white bg-transparent'
                }`}
        >
            {label}
        </button>
    );
}
