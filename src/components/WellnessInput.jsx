import React from 'react';

/**
 * Reusable input component for the Wellness Tracker.
 * Features:
 * - Consistent grey background
 * - Yellow underline
 * - Optional suffix
 * - Standard input props pass-through
 */
export default function WellnessInput({ suffix, className = '', ...props }) {
    return (
        <div className={`relative flex items-center ${className} group`}>
            <input
                className={`w-full bg-gray-50 dark:bg-gray-800 border-b-2 border-yellow-400 rounded-t-sm px-2 py-1 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${suffix ? 'pr-8' : ''}`}
                {...props}
            />
            {suffix && (
                <span className="absolute right-2 text-[10px] uppercase font-bold text-slate-400 pointer-events-none group-focus-within:text-yellow-500 transition-colors">
                    {suffix}
                </span>
            )}
        </div>
    );
}
