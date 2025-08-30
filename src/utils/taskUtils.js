// Task utility functions

export const CATEGORIES = {
  Work: "#283618",
  Personal: "#003049",
  Sleep: "#fb6f92",
  Exercise: "#2a9d8f",
  Meal: "#450920",
  Learning: "#22333b",
  Break: "#985277",
  Default: "#4b5563",
}

// Generate time options (every 5 minutes)
export const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      options.push(timeString)
    }
  }
  return options
}

// Calculate duration between two times
export const calculateDuration = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number)
  const [endHours, endMinutes] = endTime.split(":").map(Number)

  let totalMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)

  // Handle overnight tasks
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  return totalMinutes
}

// Format duration for display
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0 && mins === 0) return "0m"
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Validate time continuity (total doesn't exceed 24 hours)
export const validateTimeContinuity = (tasks) => {
  const totalMinutes = tasks.reduce((sum, task) => sum + (task.duration || 0), 0)
  return totalMinutes <= 1440 // 24 hours = 1440 minutes
}

// Create default task structure
export const createDefaultTasks = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `default-${i}`,
    startTime: `${String(i).padStart(2, "0")}:00`,
    endTime: `${String(i + 1).padStart(2, "0")}:00`,
    planTask: "",
    actualTask: "",
    category: "Work",
    duration: 60,
  }))
}

// Calculate summary statistics
export const calculateSummary = (tasks) => {
  const categoryTimes = {}
  let totalPlannedTime = 0
  let totalActualTime = 0
  let totalTrackedTime = 0

  // Initialize categories
  Object.keys(CATEGORIES).forEach((cat) => {
    if (cat !== "Default") {
      categoryTimes[cat] = 0
    }
  })

  tasks.forEach((task) => {
    const duration = task.duration || 0
    totalTrackedTime += duration

    if (task.planTask && task.planTask.trim()) totalPlannedTime += duration
    if (task.actualTask && task.actualTask.trim()) totalActualTime += duration

    // Only count non-default categories
    if (task.category !== "Default" && categoryTimes.hasOwnProperty(task.category)) {
      categoryTimes[task.category] += duration
    }
  })

  const efficiency = totalPlannedTime > 0 ? (totalActualTime / totalPlannedTime) * 100 : 0

  return {
    categoryTimes,
    totalPlannedTime,
    totalActualTime,
    totalTrackedTime: Math.min(totalTrackedTime, 1440), // Cap at 24 hours
    efficiency: Math.round(efficiency),
  }
}
