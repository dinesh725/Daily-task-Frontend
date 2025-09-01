"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut, Calendar, Save, RotateCcw, Plus } from "lucide-react"
import TaskTable from "./TaskTable"
import TaskSummary from "./TaskSummary"
import Button from "../UI/Button"
import api from "../../utils/api"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { getLocalTasks, saveLocalTasks, clearLocalTasks } from '../../utils/storage';

// Add CATEGORIES constant to Dashboard component
const CATEGORIES = {
  Work: "#283618",
  Personal: "#003049",
  Sleep: "#fb6f92",
  Exercise: "#2a9d8f",
  Meal: "#450920",
  Learning: "#22333b",
  Break: "#985277",
  Default: "#4b5563",
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [error, setError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate duration between two times
  const calculateDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    let totalMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)

    // Ensure duration is at least 5 minutes
    return Math.max(totalMinutes, 5)
  }

  // Get next time option (5 minutes after given time)
  const getNextTimeOption = (time) => {
    let [hours, minutes] = time.split(":").map(Number)
    minutes += 5
    if (minutes >= 60) {
      hours += 1
      minutes = 0
    }
    if (hours >= 24) {
      hours = 23
      minutes = 55
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Compare two times (returns 1 if time1 > time2, -1 if time1 < time2, 0 if equal)
  const compareTimes = (time1, time2) => {
    const [h1, m1] = time1.split(":").map(Number)
    const [h2, m2] = time2.split(":").map(Number)
    
    if (h1 > h2) return 1
    if (h1 < h2) return -1
    if (m1 > m2) return 1
    if (m1 < m2) return -1
    return 0
  }

  // Initialize default tasks (24 hours)
  const createDefaultTasks = () => {
    const now = Date.now()
    return Array.from({ length: 24 }, (_, i) => ({
      id: `task-${now}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: `${String(i).padStart(2, "0")}:00`,
      endTime: `${String(i + 1).padStart(2, "0")}:00`,
      planTask: "",
      actualTask: "",
      category: "Default",
      duration: 60,
    }))
  }

  // Load tasks from server or localStorage
  const loadTasks = async (date = selectedDate) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from server first if online
      if (isOnline) {
        try {
          console.log('Loading tasks from server for date:', date);
          const response = await api.get(`/tasks/${date}`);
          if (response.data?.tasks) {
            const tasksWithIds = response.data.tasks.map(task => ({
              ...task,
              id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }));
            
            setTasks(tasksWithIds);
            // Save to localStorage as backup
            saveLocalTasks(date, tasksWithIds, user?.id);
            setLastSynced(new Date());
            return;
          }
        } catch (error) {
          console.error('Error fetching tasks from server:', error);
          // Continue to load from local storage if server fetch fails
        }
      }
      
      // Fall back to local storage if offline or server fetch fails
      const localTasks = getLocalTasks(date, user?.id);
      if (localTasks) {
        console.log('Loaded tasks from localStorage:', localTasks.length);
        const tasksWithIds = localTasks.map(task => ({
          ...task,
          id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
        setTasks(tasksWithIds);
      } else {
        console.log('No tasks found in localStorage, using default tasks');
        setTasks(createDefaultTasks());
      }
    } catch (error) {
      console.error('Unexpected error in loadTasks:', error);
      setError("Failed to load tasks. Please try refreshing the page.");
      toast.error("Failed to load tasks. Using local version if available.");
    } finally {
      setLoading(false);
    }
  };

  // Function to sync tasks with backend
  const syncTasksWithBackend = async (tasksToSync, date) => {
    if (!navigator.onLine) {
      console.log('Device is offline. Tasks will be synced when back online.');
      return { success: false, error: 'Device is offline' };
    }

    try {
      console.log('Syncing tasks with backend:', { date, taskCount: tasksToSync.length });
      
      // Calculate summary
      const summary = calculateSummary(tasksToSync);
      
      // Prepare tasks with required fields
      const tasks = tasksToSync.map(task => ({
        id: task.id,
        startTime: task.startTime,
        endTime: task.endTime,
        planTask: task.planTask || '',
        actualTask: task.actualTask || '',
        category: task.category || 'Uncategorized',
        duration: task.duration || 0
      }));

      const response = await api.post(`/tasks/${date}`, { tasks, summary });
      
      if (response.data) {
        console.log('Tasks synced successfully:', response.data);
        // Update local storage with the synced tasks
        saveLocalTasks(date, tasksToSync);
        setLastSynced(new Date());
        return { success: true };
      }
      
      return { success: false, error: 'Failed to sync tasks' };
    } catch (error) {
      console.error('Error syncing tasks:', error);
      
      // If offline, save tasks locally
      if (!navigator.onLine) {
        saveLocalTasks(date, tasksToSync);
        return { 
          success: false, 
          error: 'Device is offline. Changes saved locally and will sync when back online.' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to sync tasks. Changes saved locally.' 
      };
    }
  };

  // Save tasks to both backend and localStorage
  const saveTasks = async () => {
    setSaving(true);
    const summary = calculateSummary(tasks);
    
    // Prepare the data to be saved
    const taskData = {
      tasks: tasks.map(task => ({
        id: task.id,
        startTime: task.startTime,
        endTime: task.endTime,
        planTask: task.planTask,
        actualTask: task.actualTask,
        category: task.category,
        duration: task.duration
      })),
      summary
    };

    try {
      // Always save to localStorage first for immediate feedback
      saveLocalTasks(selectedDate, tasks, user?.id);
      
      // Try to save to backend if online
      if (isOnline) {
        try {
          console.log('Saving tasks to server:', {
            date: selectedDate,
            taskCount: taskData.tasks.length,
            hasSummary: !!summary
          });
          
          const response = await api.post(`/tasks/${selectedDate}`, taskData);
          
          if (response.status === 200 || response.status === 201) {
            toast.success("Tasks saved successfully!");
            return true;
          }
        } catch (error) {
          console.error('Error saving to server:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              data: error.config?.data
            }
          });
          
          // If we get a 400, it's likely a data validation error
          if (error.response?.status === 400) {
            toast.error("Couldn't save to server: Invalid data. Please check your tasks and try again.");
            return false;
          }
          
          // For other errors, fall back to local storage
          toast.success("Tasks saved locally. Will sync when back online.");
          return false;
        }
      } else {
        toast.success("Tasks saved locally. Will sync when back online.");
        return true;
      }
    } catch (error) {
      console.error('Unexpected error in saveTasks:', error);
      toast.error("Failed to save tasks. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Sync local changes with backend when coming back online
  useEffect(() => {
    if (isOnline) {
      const syncTasks = async () => {
        const localTasks = getLocalTasks(selectedDate, user?.id);
        if (localTasks) {
          await syncTasksWithBackend(localTasks, selectedDate);
        }
      };
      syncTasks();
    }
  }, [isOnline, selectedDate, user?.id]);

  // Calculate summary data
  const calculateSummary = (taskList) => {
    const categoryTimes = {}
    let totalPlannedTime = 0
    let totalActualTime = 0

    // Initialize categories (exclude Default)
    Object.keys(CATEGORIES).forEach((cat) => {
      if (cat !== "Default") {
        categoryTimes[cat] = 0
      }
    })

    taskList.forEach((task) => {
      const duration = task.duration || 0
      if (task.planTask.trim()) totalPlannedTime += duration
      if (task.actualTask.trim()) totalActualTime += duration

      // Only count non-default categories in summary
      if (task.category !== "Default" && categoryTimes.hasOwnProperty(task.category)) {
        categoryTimes[task.category] += duration
      }
    })

    const efficiency = totalPlannedTime > 0 ? (totalActualTime / totalPlannedTime) * 100 : 0

    return {
      totalPlannedTime,
      totalActualTime,
      efficiency: Math.round(efficiency),
      categories: categoryTimes,
    }
  }

  // Clear all tasks
  const clearTasks = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      setTasks(createDefaultTasks());
      clearLocalTasks(selectedDate, user?.id);
      toast.success("Tasks cleared");
    }
  }

  // Add new task row
  const addTaskRow = (afterIndex) => {
    const prevTask = tasks[afterIndex]
    const nextTask = tasks[afterIndex + 1]
    
    // Calculate start time (end time of previous task)
    const startTime = prevTask.endTime
    
    // Calculate end time (next task's start time if exists, or next time option)
    let endTime = nextTask ? nextTask.startTime : getNextTimeOption(startTime)
    
    // Ensure end time is after start time
    if (compareTimes(endTime, startTime) <= 0) {
      endTime = getNextTimeOption(startTime)
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      startTime,
      endTime,
      planTask: "",
      actualTask: "",
      category: "Default",
      duration: calculateDuration(startTime, endTime),
    }

    const newTasks = [...tasks]
    newTasks.splice(afterIndex + 1, 0, newTask)
    
    // If there's a next task, update its start time to match the new task's end time
    if (afterIndex + 2 < newTasks.length) {
      newTasks[afterIndex + 2].startTime = endTime
      newTasks[afterIndex + 2].duration = calculateDuration(
        endTime, 
        newTasks[afterIndex + 2].endTime
      )
    }
    
    setTasks(newTasks)
  }

  // Update task
  const updateTask = (taskId, updates) => {
    if (!taskId) {
      console.error("Cannot update task without ID")
      return
    }

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex(task => task.id === taskId)
      if (taskIndex === -1) return prevTasks
      
      const newTasks = [...prevTasks]
      const task = newTasks[taskIndex]
      
      // Apply updates
      newTasks[taskIndex] = {
        ...task,
        ...updates,
      }
      
      // If end time changed, update next task's start time
      if (updates.endTime && taskIndex < newTasks.length - 1) {
        newTasks[taskIndex + 1].startTime = updates.endTime
        newTasks[taskIndex + 1].duration = calculateDuration(
          updates.endTime,
          newTasks[taskIndex + 1].endTime
        )
      }
      
      // If start time changed (only possible for first task), update end time if needed
      if (updates.startTime && taskIndex === 0) {
        if (compareTimes(updates.startTime, task.endTime) >= 0) {
          newTasks[taskIndex].endTime = getNextTimeOption(updates.startTime)
          newTasks[taskIndex].duration = calculateDuration(
            updates.startTime,
            newTasks[taskIndex].endTime
          )
        }
      }
      
      return newTasks
    })
  }

  // Delete task row
  const deleteTaskRow = (taskId) => {
    if (tasks.length <= 1) {
      toast.error("Cannot delete the last task")
      return
    }
    
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex(task => task.id === taskId)
      if (taskIndex === -1) return prevTasks
      
      const newTasks = prevTasks.filter((task) => task.id !== taskId)
      
      // If not the last task, update next task's start time to previous task's end time
      if (taskIndex > 0 && taskIndex < newTasks.length) {
        newTasks[taskIndex].startTime = newTasks[taskIndex - 1].endTime
        newTasks[taskIndex].duration = calculateDuration(
          newTasks[taskIndex].startTime,
          newTasks[taskIndex].endTime
        )
      }
      
      return newTasks
    })
  }

  // Load tasks when date changes
  useEffect(() => {
    loadTasks()
  }, [selectedDate])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (tasks.length > 0) {
        saveTasks()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [tasks, selectedDate])

  // Add this new function
  const debugLocalStorage = () => {
    if (typeof window === 'undefined') {
      console.log('Not in browser environment');
      return;
    }
    
    const storageKey = `daily_tasks_${user?.id || 'anonymous'}`;
    const data = localStorage.getItem(storageKey);
    
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('Storage Key:', storageKey);
    console.log('Current Date:', selectedDate);
    console.log('User ID:', user?.id || 'anonymous');
    console.log('All Data:', data ? JSON.parse(data) : 'No data');
    console.log('Current Date Data:', getLocalTasks(selectedDate, user?.id));
    console.log('==========================');
    
    toast.success('Check console for localStorage debug info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0 sm:gap-x-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task Manager</h1>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={saveTasks}
                  disabled={saving || !isOnline}
                  className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${isOnline ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  title={isOnline ? 'Sync with server' : 'Cannot sync while offline'}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Sync'}
                </button>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs sm:text-sm text-gray-600 truncate">Welcome, {user?.name}</span>
              <Button variant="outline" size="small" onClick={logout}>
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <button 
                onClick={debugLocalStorage}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Debug localStorage"
              >
                🐞 Debug
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button onClick={saveTasks} loading={saving} disabled={saving} size="small" className="text-xs sm:text-sm">
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Save Tasks
          </Button>
          <Button variant="outline" onClick={clearTasks} size="small" className="text-xs sm:text-sm bg-transparent">
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Clear All
          </Button>
          <Button
            variant="outline"
            onClick={() => addTaskRow(tasks.length - 1)}
            size="small"
            className="text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add Row
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="loading-spinner w-6 h-6 sm:w-8 sm:h-8"></div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading tasks...</span>
          </div>
        ) : (
          <>
            {/* Task Table */}
            <TaskTable tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTaskRow} onAddTask={addTaskRow} />

            {/* Summary */}
            <TaskSummary tasks={tasks} />
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard