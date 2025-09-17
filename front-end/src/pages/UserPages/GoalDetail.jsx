import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getGoalById, updateDailyTaskStatus, updateWeeklyTaskStatus, updateMonthlyTaskStatus } from '@/store/task'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, Target, CheckCircle2, Circle, CalendarDays, Timer, Map, Gamepad2, BookOpen, ExternalLink, Video, FileText, Link, X } from 'lucide-react'
import {   Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,DialogOverlay } from '@/components/ui/dialog'
const GoalDetail = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { goalId } = useParams()
    const { user } = useSelector((state) => state.auth)
    const { selectedGoal, loading, error } = useSelector((state) => state.task)
    const [activeTab, setActiveTab] = useState('daily')
    const [resourcesDialog, setResourcesDialog] = useState(false)
    const [selectedResources, setSelectedResources] = useState([])
    
    // Local state to track individual task completion
    const [taskStates, setTaskStates] = useState({
        daily: {},
        weekly: {},
        monthly: {}
    })

    useEffect(() => {
        if (user && goalId) {
            dispatch(getGoalById({ goalId, user }))
        }
    }, [dispatch, user, goalId])

    // Initialize task states when goal data is loaded
    useEffect(() => {
        if (selectedGoal) {
            const initializeTaskStates = (taskGroups, taskType) => {
                const states = {}
                taskGroups?.forEach((group, groupIndex) => {
                    states[groupIndex] = {}
                    group.tasks?.forEach((_, taskIndex) => {
                        states[groupIndex][taskIndex] = group.status || false
                    })
                })
                return states
            }

            setTaskStates({
                daily: initializeTaskStates(selectedGoal.dailyTasks, 'daily'),
                weekly: initializeTaskStates(selectedGoal.weeklyTasks, 'weekly'),
                monthly: initializeTaskStates(selectedGoal.monthlyTasks, 'monthly')
            })
        }
    }, [selectedGoal])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
        console.log(error);
    }, [error])

    const handleIndividualTaskToggle = (taskType, groupIndex, taskIndex) => {
        setTaskStates(prevStates => {
            const newStates = { ...prevStates }
            const currentTaskState = newStates[taskType][groupIndex][taskIndex]
            newStates[taskType][groupIndex][taskIndex] = !currentTaskState

            // Check if all tasks in this group are now completed
            const groupTasks = newStates[taskType][groupIndex]
            const allTasksCompleted = Object.values(groupTasks).every(status => status === true)
            const anyTaskCompleted = Object.values(groupTasks).some(status => status === true)

            // If all tasks are completed, update the backend
            if (allTasksCompleted && !currentTaskState) {
                handleGroupStatusUpdate(taskType, groupIndex, true)
            }
            // If this was the last completed task being unchecked, update backend to incomplete
            else if (!anyTaskCompleted && currentTaskState) {
                handleGroupStatusUpdate(taskType, groupIndex, false)
            }

            return newStates
        })
    }

    const handleGroupStatusUpdate = async (taskType, groupIndex, status) => {
        try {
            if (taskType === 'daily') {
                await dispatch(updateDailyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            } else if (taskType === 'weekly') {
                await dispatch(updateWeeklyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            } else if (taskType === 'monthly') {
                await dispatch(updateMonthlyTaskStatus({ 
                    goalId, 
                    taskIndex: groupIndex,
                    status, 
                    user 
                })).unwrap()
            }
            
            await dispatch(getGoalById({ goalId, user }))
            
            toast.success(`Task group ${status ? 'completed' : 'marked as incomplete'}!`)
        } catch (error) {
            toast.error('Failed to update task status')
        }
    }

    const getTaskCompletionCount = (taskType, groupIndex) => {
        if (!taskStates[taskType][groupIndex]) return { completed: 0, total: 0 }
        
        const groupTasks = taskStates[taskType][groupIndex]
        const completed = Object.values(groupTasks).filter(status => status === true).length
        const total = Object.keys(groupTasks).length
        
        return { completed, total }
    }

    const isTaskCompleted = (taskType, groupIndex, taskIndex) => {
        return taskStates[taskType][groupIndex]?.[taskIndex] || false
    }

    const handleResourcesClick = (resources, groupLabel) => {
        setSelectedResources({ resources, groupLabel })
        setResourcesDialog(true)
    }

    const getResourceIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'video':
                return <Video className="w-4 h-4" />
            case 'article':
            case 'blog':
                return <FileText className="w-4 h-4" />
            case 'link':
            case 'website':
                return <Link className="w-4 h-4" />
            default:
                return <ExternalLink className="w-4 h-4" />
        }
    }

    const renderTaskList = (taskGroups, taskType) => {
        if (!taskGroups || taskGroups.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-gray-600">No {taskType} tasks available</p>
                </div>
            )
        }

        return (
            <div className="space-y-4 sm:space-y-6">
                {taskGroups.map((group, groupIndex) => {
                    const { completed, total } = getTaskCompletionCount(taskType, groupIndex)
                    const isGroupCompleted = completed === total && total > 0
                    const hasResources = group.resources && group.resources.length > 0
                    
                    return (
                        <div key={groupIndex} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex flex-col sm:flex-row sm:items-center">
                                    <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-0 sm:mr-3 inline-block w-fit">
                                        {group.label}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600">
                                        ({completed}/{total} completed)
                                    </span>
                                    {isGroupCompleted && (
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-0 sm:ml-2 mt-1 sm:mt-0" />
                                    )}
                                </h3>
                                
                                {hasResources && (
                                    <Dialog open={resourcesDialog} onOpenChange={setResourcesDialog}>
                                        <DialogTrigger asChild>
                                            <button
                                                onClick={() => handleResourcesClick(group.resources, group.label)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 w-fit mt-2 sm:mt-0"
                                            >
                                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span>Resources ({group.resources.length})</span>
                                            </button>
                                        </DialogTrigger>
                                    </Dialog>
                                )}
                            </div>
                            
                            {group.tasks && group.tasks.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                    {group.tasks.map((taskContent, taskIndex) => {
                                        const isCompleted = isTaskCompleted(taskType, groupIndex, taskIndex)
                                        
                                        return (
                                            <div 
                                                key={taskIndex}
                                                className={`bg-white border rounded-lg p-3 sm:p-4 transition-all duration-200 ${
                                                    isCompleted 
                                                        ? 'border-green-300 bg-green-50' 
                                                        : 'border-gray-200 hover:border-green-300'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <button
                                                        onClick={() => handleIndividualTaskToggle(taskType, groupIndex, taskIndex)}
                                                        className="mt-0.5 sm:mt-1 flex-shrink-0 p-1"
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
                                                        )}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm sm:text-base leading-relaxed ${
                                                            isCompleted 
                                                                ? 'line-through text-gray-500' 
                                                                : 'text-gray-800'
                                                        }`}>
                                                            {taskContent}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">No tasks in this group</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const getCompletionStats = (taskGroups) => {
        if (!taskGroups || taskGroups.length === 0) return { completed: 0, total: 0, percentage: 0 }
        
        const completed = taskGroups.filter(group => group.status).length
        const total = taskGroups.length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        
        return { completed, total, percentage }
    }

    if (loading.getGoalById) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20 sm:pt-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }

    if (!selectedGoal) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20 sm:pt-0 px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Goal not found</h3>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    // Calculate stats after all early returns
    const dailyStats = getCompletionStats(selectedGoal?.dailyTasks)
    const weeklyStats = getCompletionStats(selectedGoal?.weeklyTasks)
    const monthlyStats = getCompletionStats(selectedGoal?.monthlyTasks)

    const overallStats = {
        completed: dailyStats.completed + weeklyStats.completed + monthlyStats.completed,
        total: dailyStats.total + weeklyStats.total + monthlyStats.total
    }
    overallStats.percentage = overallStats.total > 0 ? Math.round((overallStats.completed / overallStats.total) * 100) : 0

    return (
        <div className="min-h-screen bg-white pt-16 sm:pt-0">
            <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                                        {selectedGoal.goalTitle}
                                    </h1>
                                    {selectedGoal.isCompleted && (
                                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center w-fit mt-1 sm:mt-0">
                                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                                        <span>{selectedGoal.duration}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                                        <span>{selectedGoal.totalDays} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Map View Button - Added here in the best location */}
                        <div className="flex-shrink-0 ml-4">
                            <button
                                onClick={() => navigate(`/user/goal/${goalId}/map`)}
                                className="bg-green-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium 
                                        transition-colors duration-300 flex items-center space-x-2 
                                        hover:bg-white hover:text-green-600 hover:border hover:border-green-600 cursor-pointer"
                                title="Switch to Adventure Map View"
                            >
                                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Adventure Map</span>
                                <span className="sm:hidden">Map</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                <div className={`rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 ${selectedGoal.isCompleted ? 'bg-green-100 border-2 border-green-300' : 'bg-green-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Overall Progress</h2>
                        {selectedGoal.isCompleted && (
                            <div className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center w-fit">
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Goal Completed! 🎉
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                                {overallStats.percentage}%
                            </div>
                            <div className="text-gray-600 text-xs sm:text-sm">Complete</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                                {dailyStats.completed}/{dailyStats.total}
                            </div>
                            <div className="text-gray-600 text-xs sm:text-sm">Daily Tasks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                                {weeklyStats.completed}/{weeklyStats.total}
                            </div>
                            <div className="text-gray-600 text-xs sm:text-sm">Weekly Tasks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                                {monthlyStats.completed}/{monthlyStats.total}
                            </div>
                            <div className="text-gray-600 text-xs sm:text-sm">Monthly Tasks</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${overallStats.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="sticky top-[89px] sm:top-[73px] bg-white border-b border-gray-200 z-10">
                        <nav className="flex px-4 sm:px-6 overflow-x-auto">
                            {[
                                { id: 'daily', label: 'Daily Tasks', icon: Timer, count: dailyStats.total },
                                { id: 'weekly', label: 'Weekly Tasks', icon: CalendarDays, count: weeklyStats.total },
                                { id: 'monthly', label: 'Monthly Tasks', icon: Calendar, count: monthlyStats.total }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 sm:py-4 px-1 sm:px-1 mr-6 sm:mr-8 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                                        activeTab === tab.id 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'daily' && renderTaskList(selectedGoal.dailyTasks, 'daily')}
                        {activeTab === 'weekly' && renderTaskList(selectedGoal.weeklyTasks, 'weekly')}
                        {activeTab === 'monthly' && renderTaskList(selectedGoal.monthlyTasks, 'monthly')}
                    </div>
                </div>
            </div>

            {/* Resources Dialog */}
            <Dialog open={resourcesDialog} onOpenChange={setResourcesDialog}>
            {/* Overlay with blur */}
            <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />

            <DialogContent
                className="w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-2xl max-h-[85vh] overflow-y-auto z-[9999] rounded-2xl bg-white shadow-xl"
            >
                <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <span>Resources: {selectedResources.groupLabel}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm sm:text-base">
                    Helpful resources and materials for this task group
                </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                {selectedResources.resources && selectedResources.resources.length > 0 ? (
                    selectedResources.resources.map((resource, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 transition-colors bg-white shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                            <div className="text-green-500">
                                {getResourceIcon(resource.type)}
                            </div>
                            <h4 className="font-medium text-gray-800 truncate">
                                {resource.title}
                            </h4>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                {resource.type || 'Resource'}
                            </span>
                            </div>
                            {resource.description && (
                            <p className="text-gray-600 text-sm mb-2 sm:mb-3">
                                {resource.description}
                            </p>
                            )}
                            {resource.url && (
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                            >
                                <span>Open Resource</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                            )}
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">
                        No resources available for this task group
                    </p>
                    </div>
                )}
                </div>
            </DialogContent>
            </Dialog>


        </div>
    )
}

export default GoalDetail