"use client"

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

const TaskSummary = ({ tasks }) => {
  // Calculate category times and totals
  const calculateSummary = () => {
    const categoryTimes = {}
    let totalPlannedTime = 0
    let totalActualTime = 0
    let totalTrackedTime = 0

    // Initialize categories (exclude Default)
    Object.keys(CATEGORIES).forEach((cat) => {
      if (cat !== "Default") {
        categoryTimes[cat] = 0
      }
    })

    tasks.forEach((task) => {
      const duration = task.duration || 0
      totalTrackedTime += duration

      if (task.planTask.trim()) totalPlannedTime += duration
      if (task.actualTask.trim()) totalActualTime += duration

      // Only count non-default categories in summary
      if (task.category !== "Default" && categoryTimes.hasOwnProperty(task.category)) {
        categoryTimes[task.category] += duration
      }
    })

    return {
      categoryTimes,
      totalPlannedTime,
      totalActualTime,
      totalTrackedTime: Math.min(totalTrackedTime, 1440), // Cap at 24 hours
    }
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

  const summary = calculateSummary()
  const efficiency = summary.totalPlannedTime > 0 ? (summary.totalActualTime / summary.totalPlannedTime) * 100 : 0

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Summary</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total Tracked Time</h3>
          <p className="text-2xl font-bold text-blue-900">{formatDuration(summary.totalTrackedTime)}</p>
          <p className="text-xs text-blue-600 mt-1">Capped at 24 hours</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-1">Planned Time</h3>
          <p className="text-2xl font-bold text-green-900">{formatDuration(summary.totalPlannedTime)}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Efficiency</h3>
          <p className="text-2xl font-bold text-purple-900">{efficiency.toFixed(1)}%</p>
          <p className="text-xs text-purple-600 mt-1">Actual vs Planned</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>

        {Object.entries(summary.categoryTimes)
          .filter(([, minutes]) => minutes > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([category, minutes]) => {
            const percentage = summary.totalTrackedTime > 0 ? (minutes / summary.totalTrackedTime) * 100 : 0

            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-600">
                    {formatDuration(minutes)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out relative"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: CATEGORIES[category],
                    }}
                  >
                    {percentage > 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

        {Object.values(summary.categoryTimes).every((minutes) => minutes === 0) && (
          <p className="text-gray-500 text-center py-8">
            No category data available. Start adding tasks to see your breakdown!
          </p>
        )}
      </div>
    </div>
  )
}

export default TaskSummary