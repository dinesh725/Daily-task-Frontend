// Get the storage key scoped by user ID
const getStorageKey = (userId) => `daily_tasks_${userId || 'anonymous'}`;

// Get tasks from localStorage
export const getLocalTasks = (date, userId) => {
  try {
    if (typeof window === 'undefined') return null;
    
    const storageKey = getStorageKey(userId);
    const data = localStorage.getItem(storageKey);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed[date] || null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Save tasks to localStorage
export const saveLocalTasks = (date, tasks, userId) => {
  try {
    if (typeof window === 'undefined') return;
    
    if (!date) {
      console.error('Cannot save tasks: No date provided');
      return;
    }
    
    if (!Array.isArray(tasks)) {
      console.error('Cannot save tasks: Invalid tasks array');
      return;
    }
    
    const storageKey = getStorageKey(userId);
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    // Only save if we have valid tasks
    if (tasks.length > 0) {
      existingData[date] = tasks;
      localStorage.setItem(storageKey, JSON.stringify(existingData));
      console.log('Saved tasks to localStorage:', { date, userId, storageKey });
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Clear tasks for a specific date
export const clearLocalTasks = (date, userId) => {
  try {
    if (typeof window === 'undefined') return;
    
    const storageKey = getStorageKey(userId);
    
    if (date) {
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      delete existingData[date];
      localStorage.setItem(storageKey, JSON.stringify(existingData));
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
