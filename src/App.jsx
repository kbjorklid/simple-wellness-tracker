import React, { useState } from 'react';
import Header from './components/Header';
import Stats from './components/Stats';
import ProgressBar from './components/ProgressBar';
import ActivityLog from './components/ActivityLog';
import SettingsDialog from './components/SettingsDialog';
import Toast from './components/Toast';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import DatePicker from './components/DatePicker';
import { format } from 'date-fns';
import Toggle from './components/Toggle';

import LibraryModal from './components/LibraryModal';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [toastState, setToastState] = useState(null); // { message, undoId }

  // Fetch items for specific date
  const items = useLiveQuery(
    () => db.items.where('date').equals(currentDate).filter(item => !item.deleted).toArray(),
    [currentDate]
  ) || [];

  // Fetch settings for continuum (effective date <= currentDate)
  const userSettings = useLiveQuery(
    () => db.userSettings.where('date').belowOrEqual(currentDate).last(),
    [currentDate]
  );

  // Fetch day status
  const currentDay = useLiveQuery(
    () => db.days.get(currentDate),
    [currentDate]
  );

  const isDayComplete = currentDay?.isComplete || false;

  const rmr = userSettings?.rmr || 2000; // Default RMR
  const deficit = userSettings?.deficit || 0;
  const goal = rmr - deficit;

  const handleAdd = async (newItem) => {
    try {
      await db.items.add({ ...newItem, date: currentDate });
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleAddFromLibrary = async (newItems) => {
    try {
      await db.items.bulkAdd(newItems.map(item => ({ ...item, date: currentDate })));
      setToastState({ message: `Added ${newItems.length} item${newItems.length !== 1 ? 's' : ''}` });
    } catch (error) {
      console.error("Failed to add from library:", error);
    }
  };

  const handleSaveToLibrary = async (item) => {
    try {
      const normName = item.name.trim().toLowerCase();
      const exists = await db.library.where('norm_name').equals(normName).first();

      if (exists) {
        setToastState({ message: 'Item already exists in library' });
        return;
      }

      await db.library.add({
        name: item.name.trim(),
        type: item.type,
        calories: parseInt(item.calories) || 0,
        minutes: parseInt(item.minutes) || 30, // Default or existing
        description: item.description || '',
        norm_name: normName
      });
      setToastState({ message: 'Saved to library' });
    } catch (error) {
      console.error("Failed to save to library:", error);
      setToastState({ message: 'Failed to save to library' });
    }
  };

  const handleUpdate = async (id, changes) => {
    try {
      await db.items.update(id, changes);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Soft delete
      await db.items.update(id, { deleted: 1 });
      setToastState({
        message: 'Item deleted',
        undoId: id
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleUndo = async () => {
    if (toastState?.undoId) {
      try {
        await db.items.update(toastState.undoId, { deleted: 0 });
        setToastState(null);
      } catch (error) {
        console.error("Failed to undo deletion:", error);
      }
    }
  };

  const handleCloseToast = () => {
    setToastState(null);
  };

  const handleToggleComplete = async (e) => {
    const isComplete = e.target.checked;
    await db.days.put({ date: currentDate, isComplete });
  };

  const changeDate = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const resetToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-gray-100 min-h-screen flex flex-col">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentDate={currentDate}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAdd={handleAddFromLibrary}
      />

      <main className="flex-1 flex flex-col items-center py-4 px-4 lg:px-8 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col gap-3">

          {/* Date Nav */}
          <div className="flex justify-between items-center gap-2 p-2 rounded-lg bg-white dark:bg-card-dark shadow-sm border border-gray-200 dark:border-border-dark">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-input-bg-dark transition-colors text-slate-500 dark:text-gray-400"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <div className="flex flex-col items-start px-1">
                {isToday ? (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-0.5">
                    Today
                  </span>
                ) : (
                  <button
                    onClick={resetToToday}
                    className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-0.5 hover:text-primary-dark transition-colors flex items-center gap-0.5"
                  >
                    Jump to Today
                    <span className="material-symbols-outlined text-[10px] leading-none">u_turn_right</span>
                  </button>
                )}
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                  {formatDateDisplay(currentDate)}
                </h1>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-input-bg-dark transition-colors text-slate-500 dark:text-gray-400"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            <div>
              <div className="flex flex-col items-end gap-1">
                <DatePicker
                  date={currentDate}
                  onSelect={(date) => setCurrentDate(format(date, 'yyyy-MM-dd'))}
                />
                <Toggle
                  checked={isDayComplete}
                  onChange={handleToggleComplete}
                  label="Day Complete"
                />
              </div>
            </div>
          </div>

          <Stats items={items} goal={goal} rmr={rmr} />
          <ProgressBar items={items} goal={goal} rmr={rmr} />
          <ActivityLog
            items={items}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            onSaveToLibrary={handleSaveToLibrary}
          />

        </div>
      </main >

      {toastState && (
        <Toast
          message={toastState.message}
          onUndo={toastState.undoId ? handleUndo : undefined}
          onClose={handleCloseToast}
        />
      )
      }
    </div >
  );
}

export default App;
