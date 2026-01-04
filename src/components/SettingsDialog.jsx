import React, { useState, useEffect } from 'react';
import { db } from '../db';
import WellnessInput from './WellnessInput';

export default function SettingsDialog({ isOpen, onClose, currentDate, onManageLibrary, settings }) {
    const [weight, setWeight] = useState('');
    const [rmr, setRmr] = useState('');
    const [deficit, setDeficit] = useState('');

    useEffect(() => {
        if (settings) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setWeight(settings.weight);
            setRmr(settings.rmr);
            setDeficit(settings.deficit);
        } else if (isOpen) {
            // Defaults handled by initial state '' or could be set here
        }
    }, [settings, isOpen]);

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
                        <WellnessInput
                            type="number"
                            placeholder="e.g. 75"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">RMR (Resting Metabolic Rate)</label>
                        <WellnessInput
                            type="number"
                            placeholder="e.g. 1800"
                            value={rmr}
                            onChange={(e) => setRmr(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 dark:text-gray-500">The calories your body burns at rest.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Target Deficit</label>
                        <WellnessInput
                            type="number"
                            placeholder="e.g. 500"
                            value={deficit}
                            onChange={(e) => setDeficit(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 dark:text-gray-500">How many calories below your RMR you want to eat.</p>
                    </div>
                </div>

                <div className="px-6 pb-2">
                    <button
                        onClick={onManageLibrary}
                        className="w-full text-left px-4 py-3 rounded-lg border border-border-dark bg-[#2a2715] hover:bg-[#332f1a] text-text-secondary hover:text-white transition-colors flex items-center justify-between group"
                    >
                        <span className="font-medium text-sm">Manage Item Library</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
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
