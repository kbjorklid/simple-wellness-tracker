
import React from 'react';
import { DayPicker } from 'react-day-picker';

import "react-day-picker/style.css";

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={`p-3 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-gray-200 dark:border-border-dark ${className}`}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-slate-900 dark:text-gray-100",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center justify-center transition-colors text-slate-500 dark:text-gray-400",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-slate-900 dark:text-gray-100",
                day_selected:
                    "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-md",
                day_today: "bg-gray-100 dark:bg-gray-800 text-slate-900 dark:text-gray-100",
                day_outside:
                    "text-slate-400 dark:text-gray-500 opacity-50",
                day_disabled: "text-slate-400 opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary/10 aria-selected:text-primary",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: () => <span className="material-symbols-outlined text-[18px]">chevron_left</span>,
                IconRight: () => <span className="material-symbols-outlined text-[18px]">chevron_right</span>,
            }}
            {...props}
        />
    );
}

export default Calendar;
