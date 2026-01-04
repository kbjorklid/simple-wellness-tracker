import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import LibraryItemRow from './LibraryItemRow';

export default function LibraryModal({ isOpen, onClose, onAdd }) {
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, FOOD, EXERCISE
    const [selection, setSelection] = useState({}); // { [id]: { selected: boolean, count: number, minutes: number } }

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setFilterType('ALL');
            setSelection({});
            setIsCreating(false);
        }
    }, [isOpen]);

    const items = useLiveQuery(
        () => {
            let collection = db.library.toCollection();

            // Apply sorting/filtering if needed, but for search/type we might need to filter in memory 
            // or use compound index. Given library size is likely small (<1000), in-memory filter is fine.
            return collection.toArray().then(items => {
                return items.sort((a, b) => {
                    // Sort by lastUsed (descending), then by name (ascending)
                    const dateA = a.lastUsed || 0;
                    const dateB = b.lastUsed || 0;
                    if (dateB !== dateA) return dateB - dateA;
                    return a.name.localeCompare(b.name);
                });
            });
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

    const handleUpdateItem = async (id, updates) => {
        try {
            await db.library.update(id, updates);
        } catch (error) {
            console.error("Failed to update library item:", error);
        }
    };



    const handleCreateItem = async (newItem) => {
        try {
            if (!newItem.name || !newItem.name.trim()) return;

            await db.library.add({
                name: newItem.name,
                type: newItem.type || 'FOOD',
                calories: parseInt(newItem.calories) || 0,
                minutes: parseInt(newItem.minutes) || 30,
                description: newItem.description || '',
                norm_name: newItem.name.trim().toLowerCase(),
                lastUsed: Date.now()
            });
            setIsCreating(false);
        } catch (error) {
            console.error("Failed to create library item:", error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await db.library.delete(id);
            // Remove from selection if it was selected
            setSelection(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (error) {
            console.error("Failed to delete library item:", error);
        }
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

        const now = Date.now();
        // Update lastUsed for selected items
        Promise.all(selectedIds.map(id =>
            db.library.update(id, { lastUsed: now })
        )).catch(err => console.error("Failed to update lastUsed:", err));

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
                        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Library</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCreating(true)}
                                className={`text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                + New Item
                            </button>
                            <button
                                onClick={onClose}
                                className="text-text-secondary hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>
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
                        {isCreating && (
                            <LibraryItemRow
                                item={{ name: '', type: 'FOOD', calories: '', description: '', minutes: 30 }}
                                initialEditing={true}
                                onCreate={handleCreateItem}
                                onCancel={() => setIsCreating(false)}
                            />
                        )}
                        {filteredItems.length === 0 && !isCreating ? (
                            <div className="text-center text-text-secondary py-8">
                                No items found in library.
                            </div>
                        ) : (
                            filteredItems.map(item => {
                                const isSelected = selection[item.id]?.selected || false;
                                const currentCount = selection[item.id]?.count || 1;
                                const currentMinutes = selection[item.id]?.minutes || item.minutes || 30;

                                return (
                                    <LibraryItemRow
                                        key={item.id}
                                        item={item}
                                        isSelected={isSelected}
                                        currentCount={currentCount}
                                        currentMinutes={currentMinutes}
                                        onSelect={handleSelect}
                                        onAdjust={handleAdjustment}
                                        onUpdate={handleUpdateItem}
                                        onDelete={handleDeleteItem}
                                    />
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
