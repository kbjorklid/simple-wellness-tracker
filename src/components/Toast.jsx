import React, { useEffect } from 'react';

export default function Toast({ message, onUndo, onClose, duration = 4000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 dark:bg-slate-800 text-white dark:text-gray-100 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px] justify-between border border-slate-700/50">
                <span className="text-sm font-medium">{message}</span>
                <div className="flex items-center gap-2">
                    {onUndo && (
                        <button
                            onClick={onUndo}
                            className="text-sm font-bold text-primary hover:text-primary-light transition-colors"
                        >
                            Undo
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
