import Dexie from 'dexie';

export const db = new Dexie('CalorieTrackerDB');

db.version(3).stores({
    items: '++id, name, type, calories, description, date, count',
    userSettings: '++id, date, weight, deficit, rmr',
    days: 'date, isComplete',
    library: '++id, name, type, calories, minutes, description, norm_name'
});

db.version(4).stores({
    library: '++id, name, type, calories, minutes, description, norm_name, lastUsed'
});

db.version(5).stores({
    userSettings: '++id, date, weight, height, gender, dob, deficit, rmr'
});


