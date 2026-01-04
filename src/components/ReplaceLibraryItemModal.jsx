import React from 'react';

export default function ReplaceLibraryItemModal({ isOpen, onClose, onConfirm, existingItem, newItem }) {
    if (!isOpen || !existingItem || !newItem) return null;

    // Helper to get changed fields (simple comparison)
    const getChanges = () => {
        const changes = [];
        if (existingItem.name !== newItem.name) changes.push({ label: 'Name', old: existingItem.name, new: newItem.name });
        if (existingItem.calories !== newItem.calories) changes.push({ label: 'Calories', old: `${existingItem.calories}`, new: `${newItem.calories}` });
        if (existingItem.type === 'EXERCISE' && existingItem.minutes !== newItem.minutes) changes.push({ label: 'Minutes', old: `${existingItem.minutes}m`, new: `${newItem.minutes}m` });
        if (existingItem.description !== newItem.description) changes.push({ label: 'Description', old: existingItem.description || '(none)', new: newItem.description || '(none)' });
        return changes;
    };

    const changes = getChanges();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
            <div className="relative flex w-full max-w-md flex-col rounded-xl bg-[#232010] shadow-2xl ring-1 ring-border-dark overflow-hidden transition-all">
                <div className="px-6 py-5 border-b border-border-dark bg-[#232010]">
                    <h2 className="text-white text-lg font-bold leading-tight">Replace Library Item?</h2>
                </div>

                <div className="p-6">
                    <p className="text-text-secondary text-sm mb-4">
                        This item already exists in your library but has different details. Do you want to replace it?
                    </p>

                    <div className="bg-[#2a2715] rounded-lg p-4 border border-border-dark flex flex-col gap-3">
                        {changes.length > 0 ? (
                            changes.map((change, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">{change.label}</span>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-slate-400 line-through decoration-slate-500/50">{change.old}</div>
                                        <div className="text-primary font-medium">{change.new}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-text-secondary text-sm">No significant changes detected.</div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#1e1c0e] border-t border-border-dark">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-bold text-[#221f10] bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
                    >
                        Replace Item
                    </button>
                </div>
            </div>
        </div>
    );
}
