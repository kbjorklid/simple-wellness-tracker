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
import ReplaceLibraryItemModal from './components/ReplaceLibraryItemModal';
import WeightDisplay from './components/WeightDisplay';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMode, setLibraryMode] = useState('select'); // 'select' or 'manage'
  const [toastState, setToastState] = useState(null); // { message, undoId, action }
  const [replaceDialogState, setReplaceDialogState] = useState(null); // { existing, new }

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

  // Fetch library items for "in library" check
  const libraryItems = useLiveQuery(
    () => db.library.toArray(),
    []
  ) || [];

  const libraryItemNames = new Set(libraryItems.map(item => item.norm_name));

  const isDayComplete = currentDay?.isComplete || false;

  const rmr = userSettings?.rmr || 2000; // Default RMR
  const deficit = userSettings?.deficit || 0;
  const goal = rmr - deficit;

  const handleAdd = async (newItem) => {
    try {
      const id = await db.items.add({ ...newItem, date: currentDate });
      return id;
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleAddFromLibrary = async (newItems) => {
    try {
      await db.items.bulkAdd(newItems.map(item => ({ ...item, date: currentDate })));
      setToastState({
        message: `Added ${newItems.length} item${newItems.length !== 1 ? 's' : ''}`,
        action: undefined
      });
    } catch (error) {
      console.error("Failed to add from library:", error);
    }
  };

  const handleSaveToLibrary = async (item) => {
    try {
      const normName = item.name.trim().toLowerCase();
      const existing = await db.library.where('norm_name').equals(normName).first();

      const newItem = {
        name: item.name.trim(),
        type: item.type,
        calories: parseInt(item.calories) || 0,
        minutes: parseInt(item.minutes) || 30,
        description: item.description || '',
        norm_name: normName,
        lastUsed: Date.now()
      };

      if (existing) {
        // Check for differences
        const hasChanges =
          existing.name !== newItem.name || // Case sensitivity
          existing.calories !== newItem.calories ||
          (existing.type === 'EXERCISE' && existing.minutes !== newItem.minutes) ||
          existing.description !== newItem.description;

        if (hasChanges) {
          setToastState({
            message: 'Item already exists in library',
            action: {
              label: 'Replace',
              onClick: () => setReplaceDialogState({ existing, new: { ...newItem, lastUsed: Date.now() } })
            }
          });
        } else {
          setToastState({ message: 'Item already exists in library' });
        }
        return;
      }

      await db.library.add(newItem);
      setToastState({ message: 'Saved to library' });
    } catch (error) {
      console.error("Failed to save to library:", error);
      setToastState({ message: 'Failed to save to library' });
    }
  };

  const handleConfirmReplace = async () => {
    if (!replaceDialogState) return;

    try {
      const { existing, new: newItem } = replaceDialogState;
      await db.library.update(existing.id, newItem);
      setToastState({ message: 'Library item updated' });
    } catch (error) {
      console.error("Failed to update library item:", error);
      setToastState({ message: 'Failed to update library item' });
    } finally {
      setReplaceDialogState(null);
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

  const handleWeightUpdate = async (newWeight) => {
    try {
      const existing = await db.userSettings.where({ date: currentDate }).first();

      if (existing) {
        await db.userSettings.update(existing.id, { weight: newWeight });
      } else {
        const rmr = userSettings?.rmr || 2000;
        const deficit = userSettings?.deficit || 0;
        await db.userSettings.add({
          date: currentDate,
          weight: newWeight,
          rmr,
          deficit
        });
      }
    } catch (error) {
      console.error("Failed to update weight:", error);
    }
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
        settings={userSettings}
        onManageLibrary={() => {
          setIsSettingsOpen(false);
          setLibraryMode('manage');
          setIsLibraryOpen(true);
        }}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAdd={handleAddFromLibrary}
        mode={libraryMode}
      />

      <ReplaceLibraryItemModal
        isOpen={!!replaceDialogState}
        existingItem={replaceDialogState?.existing}
        newItem={replaceDialogState?.new}
        onClose={() => setReplaceDialogState(null)}
        onConfirm={handleConfirmReplace}
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
                <DatePicker
                  date={currentDate}
                  onSelect={(date) => setCurrentDate(format(date, 'yyyy-MM-dd'))}
                  align="left"
                >
                  <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none hover:opacity-75 transition-opacity cursor-pointer">
                    {formatDateDisplay(currentDate)}
                  </h1>
                </DatePicker>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-input-bg-dark transition-colors text-slate-500 dark:text-gray-400"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <WeightDisplay
                  weight={userSettings?.weight}
                  onSave={handleWeightUpdate}
                />
                <div className="flex flex-col items-end gap-1">
                  <Toggle
                    checked={isDayComplete}
                    onChange={handleToggleComplete}
                    label="Day Complete"
                  />
                </div>
              </div>
            </div>
          </div>

          <Stats items={items} goal={goal} rmr={rmr} />
          <ProgressBar items={items} goal={goal} rmr={rmr} />
          <ActivityLog
            items={items}
            libraryItemNames={libraryItemNames}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onOpenLibrary={() => {
              setLibraryMode('select');
              setIsLibraryOpen(true);
            }}
            onSaveToLibrary={handleSaveToLibrary}
          />

        </div>
      </main >

      {toastState && (
        <Toast
          message={toastState.message}
          onUndo={toastState.undoId ? handleUndo : undefined}
          action={toastState.action}
          onClose={handleCloseToast}
        />
      )
      }
    </div >
  );
}

export default App;
