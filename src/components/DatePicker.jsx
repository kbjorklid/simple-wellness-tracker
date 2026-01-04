
import React, { useState, useRef, useEffect } from 'react';
import Calendar from './Calendar';
import { format, parseISO, isValid } from 'date-fns';

function DatePicker({ date, onSelect, children, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedDate = typeof date === 'string' ? parseISO(date) : date;

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (newDate) => {
        if (newDate) {
            onSelect(newDate); // Pass Date object back
            setIsOpen(false);
        }
    };

    return (
        <div className="relative inline-block" ref={containerRef}>
            {children ? (
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                    {children}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-gray-300 bg-gray-100 dark:bg-input-bg-dark rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors border border-gray-200 dark:border-border-dark"
                >
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {isValid(selectedDate) ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}
                </button>
            )}

            {isOpen && (
                <div className={`absolute top-full mt-2 z-50 ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        initialFocus
                    />
                </div>
            )}
        </div>
    );
}

export default DatePicker;
