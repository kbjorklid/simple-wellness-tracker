import React from 'react';
import ActivityItem from './ActivityItem';
import QuickAdd from './QuickAdd';

export default function ActivityLog({ items, libraryItemNames, onAdd, onDelete, onUpdate, onOpenLibrary, onOpenHistory, onSaveToLibrary }) {


    const handleQuickAdd = async (newItem) => {
        await onAdd(newItem);
    };

    return (
        <div className="rounded-lg bg-white dark:bg-card-dark shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-card-dark flex justify-between items-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm">Activity Log</h3>
            </div>
            <div className="hidden md:grid grid-cols-[20px_60px_48px_1fr_160px_60px] gap-3 px-3 py-1.5 border-b border-gray-100 dark:border-border-dark bg-white dark:bg-card-dark text-[10px] font-bold uppercase text-slate-400 dark:text-gray-500">
                <div></div>
                <div className="text-center">Count</div>
                <div className="text-center">Type</div>
                <div>Item Name</div>
                <div className="text-right">Total</div>
                <div></div>
            </div>
            <div className="flex flex-col">
                {items.map(item => (
                    <ActivityItem
                        key={item.id}
                        item={item}
                        isInLibrary={libraryItemNames?.has(item.name.trim().toLowerCase())}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onSaveToLibrary={onSaveToLibrary}
                    />
                ))}
                <QuickAdd onAdd={handleQuickAdd} />
            </div>
            <div className="p-2 border-t border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-card-dark flex gap-2">
                <button
                    onClick={onOpenHistory}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-md shadow-sm hover:border-primary hover:text-primary transition-all"
                >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Add from History
                </button>
                <button
                    onClick={onOpenLibrary}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-md shadow-sm hover:border-primary hover:text-primary transition-all"
                >
                    <span className="material-symbols-outlined text-[16px]">library_add</span>
                    Add from Library
                </button>
            </div>
        </div>
    );
}
