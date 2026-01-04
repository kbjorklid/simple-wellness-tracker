import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsDialog({ isOpen, onClose, currentDate }) {
    const [weight, setWeight] = useState('');
    const [rmr, setRmr] = useState('');
    const [deficit, setDeficit] = useState('');

    // Fetch the most recent settings on or before currentDate
    const effectiveSettings = useLiveQuery(async () => {
        if (!isOpen) return null;
        return await db.userSettings
            .where('date')
            .belowOrEqual(currentDate)
            .last();
    }, [isOpen, currentDate]);

    useEffect(() => {
        if (effectiveSettings) {
            setWeight(effectiveSettings.weight);
            setRmr(effectiveSettings.rmr);
            setDeficit(effectiveSettings.deficit);
        } else if (isOpen) {
            // Defaults if no settings exist yet
            // Don't overwrite if user has started typing, but simple case: valid when first opening
            // To be safer, we could only set if these are empty, but effectiveSettings changes on date change
            // Let's just set them.
            // If completely new, maybe defaults?
        }
    }, [effectiveSettings, isOpen]);

    const handleSave = async () => {
        try {
            // Check if there is already a setting for EXACTLY this date to update, or add new
            const existingForDate = await db.userSettings.where({ date: currentDate }).first();

            const payload = {
                date: currentDate,
                weight: parseFloat(weight) || 0,
                rmr: parseFloat(rmr) || 0,
                deficit: parseFloat(deficit) || 0
            };

            if (existingForDate) {
                await db.userSettings.update(existingForDate.id, payload);
            } else {
                await db.userSettings.add(payload);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-border-dark overflow-hidden transform transition-all">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-card-dark">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings for {currentDate}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Current Weight (kg)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-50 dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. 75"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">RMR (Resting Metabolic Rate)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-50 dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. 1800"
                            value={rmr}
                            onChange={(e) => setRmr(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 dark:text-gray-500">The calories your body burns at rest.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Target Deficit</label>
                        <input
                            type="number"
                            className="w-full bg-gray-50 dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. 500"
                            value={deficit}
                            onChange={(e) => setDeficit(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 dark:text-gray-500">How many calories below your RMR you want to eat.</p>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-card-dark flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-white dark:hover:bg-input-bg-dark border border-transparent hover:border-gray-200 dark:hover:border-border-dark transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
