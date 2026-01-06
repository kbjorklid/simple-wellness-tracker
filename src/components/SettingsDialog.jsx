import React, { useState, useEffect } from 'react';
import { db } from '../db';
import WellnessInput from './WellnessInput';
import { calculateRMR, calculateAge, ACTIVITY_FACTORS } from '../utils/rmr';

export default function SettingsDialog({ isOpen, onClose, currentDate, onManageLibrary, settings }) {
    const [weight, setWeight] = useState('');
    const [rmr, setRmr] = useState('');
    const [deficit, setDeficit] = useState('');
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState('female');
    const [dob, setDob] = useState('');
    const [age, setAge] = useState(null);
    const [activityLevel, setActivityLevel] = useState('sedentary');

    useEffect(() => {
        if (settings) {
            setWeight(settings.weight);
            setRmr(settings.rmr);
            setDeficit(settings.deficit);
            setHeight(settings.height || '');
            setGender(settings.gender || 'female');
            setDob(settings.dob || '');
            setActivityLevel(settings.activityLevel || 'sedentary');
        } else if (isOpen) {
            // Defaults or retain current state if opening fresh
        }
    }, [settings, isOpen]);

    useEffect(() => {
        if (dob) {
            setAge(calculateAge(dob));
        } else {
            setAge(null);
        }
    }, [dob]);

    // Auto-calculate RMR (TDEE) when dependencies change
    useEffect(() => {
        if (weight && height && age && gender && activityLevel) {
            const baseRmr = calculateRMR(parseFloat(weight), parseFloat(height), age, gender);
            const factor = ACTIVITY_FACTORS[activityLevel]?.value || 1.2;
            const tdee = Math.round(baseRmr * factor);

            if (tdee > 0) {
                setRmr(tdee);
            }
        }
    }, [weight, height, age, gender, activityLevel]);


    const handleSave = async () => {
        try {
            const existingForDate = await db.userSettings.where({ date: currentDate }).first();

            const payload = {
                date: currentDate,
                weight: parseFloat(weight) || 0,
                rmr: parseFloat(rmr) || 0,
                deficit: parseFloat(deficit) || 0,
                height: parseFloat(height) || 0,
                gender: gender,
                dob: dob,
                activityLevel: activityLevel
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
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-border-dark overflow-hidden transform transition-all h-[90vh] flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-card-dark shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings for {currentDate}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="setting-gender" className="text-xs font-bold text-primary uppercase tracking-wide">Gender</label>
                            <select
                                id="setting-gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="setting-dob" className="text-xs font-bold text-primary uppercase tracking-wide">Date of Birth</label>
                            <input
                                id="setting-dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                            {age !== null && <p className="text-[10px] text-slate-500">Age: {age}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="setting-activity" className="text-xs font-bold text-primary uppercase tracking-wide">Activity Level</label>
                        <select
                            id="setting-activity"
                            value={activityLevel}
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-input-bg-dark border border-gray-200 dark:border-border-dark rounded-lg text-base font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                            {Object.entries(ACTIVITY_FACTORS).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary uppercase tracking-wide">Height (cm)</label>
                            <WellnessInput
                                type="number"
                                placeholder="e.g. 175"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary uppercase tracking-wide">Weight (kg)</label>
                            <WellnessInput
                                type="number"
                                placeholder="e.g. 75"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/20 space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-primary uppercase tracking-wide">Daily Target (TDEE)</label>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">Auto-calculated</span>
                            </div>
                            <WellnessInput
                                type="number"
                                placeholder="e.g. 2000"
                                value={rmr}
                                onChange={(e) => setRmr(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-500 dark:text-gray-500">Estimated total daily calories burned.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary uppercase tracking-wide">Deifcit Goal</label>
                            <WellnessInput
                                type="number"
                                placeholder="e.g. 500"
                                value={deficit}
                                onChange={(e) => setDeficit(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-500 dark:text-gray-500">Calories below TDEE to eat.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-2 shrink-0">
                    <button
                        onClick={onManageLibrary}
                        className="w-full text-left px-4 py-3 rounded-lg border border-border-dark bg-[#2a2715] hover:bg-[#332f1a] text-text-secondary hover:text-white transition-colors flex items-center justify-between group"
                    >
                        <span className="font-medium text-sm">Manage Item Library</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-card-dark flex justify-end gap-3 shrink-0">
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
