"use client"
import { Trash2, Plus } from "lucide-react"
import Button from "../UI/Button"

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

const TaskTable = ({ tasks, onUpdateTask, onDeleteTask, onAddTask }) => {
  // Generate time options (every 5 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        options.push(timeString)
      }
    }
    return options
  }

  // Generate end time options based on start time
  const generateEndTimeOptions = (startTime) => {
    const options = []
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const startTotalMinutes = startHour * 60 + startMinute
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const totalMinutes = hour * 60 + minute
        if (totalMinutes > startTotalMinutes) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          options.push(timeString)
        }
      }
    }
    
    // Add 23:59 as the last option
    options.push("23:59")
    return options
  }

  // Calculate duration between two times
  const calculateDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    let totalMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)

    // Ensure duration is at least 5 minutes
    return Math.max(totalMinutes, 5)
  }

  // Format duration for display
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0 && mins === 0) return "0m"
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  // Handle time change and update duration
  const handleTimeChange = (taskId, field, value) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updates = { [field]: value }

    if (field === "startTime" || field === "endTime") {
      const startTime = field === "startTime" ? value : task.startTime
      const endTime = field === "endTime" ? value : task.endTime
      
      // Ensure end time is after start time
      if (field === "startTime" && compareTimes(value, task.endTime) > 0) {
        updates.endTime = getNextTimeOption(value)
      }
      
      updates.duration = calculateDuration(
        field === "startTime" ? value : task.startTime,
        field === "endTime" ? value : task.endTime
      )
    }

    onUpdateTask(taskId, updates)
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

  // Get category color with opacity
  const getCategoryColor = (category) => {
    const color = CATEGORIES[category] || CATEGORIES.Default
    return color + "40" // Add opacity
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[80px]">Start</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[80px]">End</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[70px]">Duration</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[150px]">
                Planned Task
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[150px]">
                Actual Activity
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[100px]">Category</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: getCategoryColor(task.category) }}
              >
                {/* Start Time */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select
                    value={task.startTime}
                    onChange={(e) => handleTimeChange(task.id, "startTime", e.target.value)}
                    className="w-full border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[70px]"
                    disabled={index > 0} // Only allow editing start time for first row
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>

                {/* End Time */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select
                    value={task.endTime}
                    onChange={(e) => handleTimeChange(task.id, "endTime", e.target.value)}
                    className="w-full border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[70px]"
                  >
                    {generateEndTimeOptions(task.startTime).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Duration */}
                <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 text-xs sm:text-sm">
                  {formatDuration(task.duration || 0)}
                </td>

                {/* Planned Task */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    value={task.planTask}
                    onChange={(e) => onUpdateTask(task.id, { planTask: e.target.value })}
                    placeholder="Plan..."
                    className="w-full border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"
                  />
                </td>

                {/* Actual Activity */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <textarea
                    value={task.actualTask}
                    onChange={(e) => onUpdateTask(task.id, { actualTask: e.target.value })}
                    placeholder="Actual..."
                    rows={1}
                    className="w-full border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"
                    onInput={(e) => {
                      e.target.style.height = "auto"
                      e.target.style.height = `${e.target.scrollHeight}px`
                    }}
                  />
                </td>

                {/* Category */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select
                    value={task.category || "Default"}
                    onChange={(e) => {
                      onUpdateTask(task.id, { category: e.target.value })
                    }}
                    className="w-full border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[90px]"
                  >
                    {Object.keys(CATEGORIES).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Actions */}
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => onAddTask(tasks.indexOf(task))}
                      className="p-1"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1"
                      disabled={tasks.length <= 24}
                      title={tasks.length <= 24 ? "Minimum 24 rows required" : "Delete task"}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block sm:hidden bg-gray-100 px-4 py-2 text-xs text-gray-600 text-center">
        ← Scroll horizontally to see all columns →
      </div>
    </div>
  )
}

export default TaskTable