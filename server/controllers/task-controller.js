const Goal = require('../models/goal'); 
const mongoose = require('mongoose');
const axios = require('axios');
const  User = require('../models/User')

const MICROSERVICE_BASE_URL = process.env.MICROSERVICE_URL;

 const createGoal = async (req, res) => {
  try {
    const { goal, duration, user } = req.body; 
    const userId = user?.id || user?._id;

    if (!goal || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Goal and duration are required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    const microserviceResponse = await axios.post(`${MICROSERVICE_BASE_URL}/generate-plan`, {
      goal,
      duration
    });

    const planData = microserviceResponse.data;
    
    // Ensure dailyTasks resources are properly formatted
    const processedDailyTasks = planData.dailyTasks.map(task => ({
      ...task,
      resources: Array.isArray(task.resources) ? task.resources : []
    }));

    // Do the same for weeklyTasks and monthlyTasks if they exist
    const processedWeeklyTasks = planData.weeklyTasks?.map(task => ({
      ...task,
      resources: Array.isArray(task.resources) ? task.resources : []
    })) || [];

    const processedMonthlyTasks = planData.monthlyTasks?.map(task => ({
      ...task,
      resources: Array.isArray(task.resources) ? task.resources : []
    })) || [];

    const newGoal = new Goal({
      goalTitle: planData.goalTitle,
      totalDays: planData.totalDays,
      duration: duration,
      monthlyTasks: processedMonthlyTasks,
      weeklyTasks: processedWeeklyTasks,
      dailyTasks: processedDailyTasks,
      userId
    });

    const savedGoal = await newGoal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      taskId: savedGoal._id,
      data: savedGoal
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    
    // Log the actual data structure for debugging
    if (error.name === 'ValidationError') {
      console.log('Validation error details:', JSON.stringify(error.errors, null, 2));
    }
    
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error generating plan from microservice',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

const getAllGoals = async (req, res) => {
  try {
    const { user } = req.body; 
    const userId = user?.id || user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    const goals = await Goal.find({ userId })
      .sort({ createdAt: -1 })
      .select('goalTitle duration _id isCompleted createdAt');

    res.status(200).json({
      success: true,
      data: goals
    });

  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  const getGoalById= async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId }).select('-__v');

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        data: goal
      });

    } catch (error) {
      console.error('Error fetching goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const updateGoal= async (req, res) => {
    try {
      const { id } = req.params;
      const { user, goalTitle, duration } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const updateData = {};
      if (goalTitle) updateData.goalTitle = goalTitle;
      if (duration) updateData.duration = duration;

      const goal = await Goal.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        data: goal,
        message: 'Goal updated successfully'
      });

    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
const checkAllTasksCompleted = (goal) => {
  const allDailyCompleted = goal.dailyTasks.every(task => task.status === true);
  const allWeeklyCompleted = goal.weeklyTasks.every(task => task.status === true);
  const allMonthlyCompleted = goal.monthlyTasks.every(task => task.status === true);
  
  return allDailyCompleted && allWeeklyCompleted && allMonthlyCompleted;
}
  const updateDailyTaskStatus= async (req, res) => {
    try {
      const { id } = req.params;
      const { taskIndex, status, user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (taskIndex < 0 || taskIndex >= goal.dailyTasks.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task index'
        });
      }
      goal.dailyTasks[taskIndex].status = status;
       const allTasksCompleted = checkAllTasksCompleted(goal);
      goal.isCompleted = allTasksCompleted;

      await goal.save();

      res.status(200).json({
      success: true,
      message: 'Daily task status updated successfully',
      data: {
        taskIndex,
        newStatus: status,
        taskLabel: goal.dailyTasks[taskIndex].label,
        isCompleted: goal.isCompleted
      }
    });

    } catch (error) {
      console.error('Error updating daily task status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const updateWeeklyTaskStatus= async (req, res) => {
    try {
      const { id } = req.params;
      const { taskIndex, status, user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (taskIndex < 0 || taskIndex >= goal.weeklyTasks.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task index'
        });
      }

      goal.weeklyTasks[taskIndex].status = status;
    const allTasksCompleted = checkAllTasksCompleted(goal);
    goal.isCompleted = allTasksCompleted;
      await goal.save();

      res.status(200).json({
        success: true,
        message: 'Weekly task status updated successfully',
        data: {
          taskIndex,
          newStatus: status,
          taskLabel: goal.weeklyTasks[taskIndex].label,
          isCompleted: goal.isCompleted
        }
      });

    } catch (error) {
      console.error('Error updating weekly task status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const updateMonthlyTaskStatus= async (req, res) => {
    try {
      const { id } = req.params;
      const { taskIndex, status, user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (taskIndex < 0 || taskIndex >= goal.monthlyTasks.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task index'
        });
      }

      goal.monthlyTasks[taskIndex].status = status;
      const allTasksCompleted = checkAllTasksCompleted(goal);
      goal.isCompleted = allTasksCompleted;
      await goal.save();
      res.status(200).json({
      success: true,
      message: 'Monthly task status updated successfully',
      data: {
        taskIndex,
        newStatus: status,
        taskLabel: goal.monthlyTasks[taskIndex].label,
        isCompleted: goal.isCompleted
      }
    });
    } catch (error) {
      console.error('Error updating monthly task status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const getDailyTasks= async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId }).select('dailyTasks goalTitle');

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          goalTitle: goal.goalTitle,
          dailyTasks: goal.dailyTasks
        }
      });

    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const getWeeklyTasks= async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId }).select('weeklyTasks goalTitle');

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          goalTitle: goal.goalTitle,
          weeklyTasks: goal.weeklyTasks
        }
      });

    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  const getMonthlyTasks= async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOne({ _id: id, userId }).select('monthlyTasks goalTitle');

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          goalTitle: goal.goalTitle,
          monthlyTasks: goal.monthlyTasks
        }
      });

    } catch (error) {
      console.error('Error fetching monthly tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 const  deleteGoal= async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body; 
      const userId = user?.id || user?._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid goal ID format'
        });
      }

      const goal = await Goal.findOneAndDelete({ _id: id, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
        data: { 
          deletedGoalId: id,
          deletedGoalTitle: goal.goalTitle
        }
      });

    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

const getGoalStats = async (req, res) => {
  try {
    const { user } = req.body; 
    const userId = user?.id || user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    const goals = await Goal.find({ userId });

    const stats = {
      totalGoals: goals.length,
      completedGoals: 0,
      totalTasks: 0,
      completedTasks: 0,
      taskBreakdown: {
        daily: { total: 0, completed: 0 },
        weekly: { total: 0, completed: 0 },
        monthly: { total: 0, completed: 0 }
      },
      goalProgress: []
    };

    goals.forEach(goal => {
      let goalTotalTasks = 0;
      let goalCompletedTasks = 0;

    
      stats.taskBreakdown.daily.total += goal.dailyTasks.length;
      const completedDailyTasks = goal.dailyTasks.filter(task => task.status).length;
      stats.taskBreakdown.daily.completed += completedDailyTasks;
      goalTotalTasks += goal.dailyTasks.length;
      goalCompletedTasks += completedDailyTasks;


      stats.taskBreakdown.weekly.total += goal.weeklyTasks.length;
      const completedWeeklyTasks = goal.weeklyTasks.filter(task => task.status).length;
      stats.taskBreakdown.weekly.completed += completedWeeklyTasks;
      goalTotalTasks += goal.weeklyTasks.length;
      goalCompletedTasks += completedWeeklyTasks;

    
      stats.taskBreakdown.monthly.total += goal.monthlyTasks.length;
      const completedMonthlyTasks = goal.monthlyTasks.filter(task => task.status).length;
      stats.taskBreakdown.monthly.completed += completedMonthlyTasks;
      goalTotalTasks += goal.monthlyTasks.length;
      goalCompletedTasks += completedMonthlyTasks;

      stats.totalTasks += goalTotalTasks;
      stats.completedTasks += goalCompletedTasks;

      const goalCompletionRate = goalTotalTasks > 0 ? 
        Math.round((goalCompletedTasks / goalTotalTasks) * 100) : 0;

      stats.goalProgress.push({
        goalId: goal._id,
        goalTitle: goal.goalTitle,
        totalTasks: goalTotalTasks,
        completedTasks: goalCompletedTasks,
        completionRate: goalCompletionRate,
        isCompleted: goal.isCompleted 
      });

      if (goal.isCompleted) {
        stats.completedGoals++;
      }
    });

    stats.overallCompletionRate = stats.totalTasks > 0 ? 
      Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
const addManualTask = async (req, res) => {
  try {
    const {
      goalTitle,
      totalDays,
      duration,
      monthlyTasks = [],
      weeklyTasks = [],
      dailyTasks = [],
      userId
    } = req.body;

    // Validation
    if (!goalTitle || !totalDays || !duration || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Goal title, total days, duration, and user ID are required'
      });
    }

    if (monthlyTasks.length === 0 && weeklyTasks.length === 0 && dailyTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one task group (monthly, weekly, or daily) must be provided'
      });
    }

    const validateTaskGroups = (taskGroups, type) => {
      for (let i = 0; i < taskGroups.length; i++) {
        const group = taskGroups[i];
        if (!group.label || !group.tasks || !Array.isArray(group.tasks) || group.tasks.length === 0) {
          throw new Error(`Invalid ${type} task group at index ${i}: label and tasks array are required`);
        }
      }
    };

    try {
      validateTaskGroups(monthlyTasks, 'monthly');
      validateTaskGroups(weeklyTasks, 'weekly');
      validateTaskGroups(dailyTasks, 'daily');
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new goal
    const newGoal = new Goal({
      goalTitle,
      totalDays,
      duration,
      monthlyTasks,
      weeklyTasks,
      dailyTasks,
      userId,
      isCompleted: false
    });

    const savedGoal = await newGoal.save();

    res.status(201).json({
      success: true,
      message: 'Manual task created successfully',
      data: savedGoal
    });

  } catch (error) {
    console.error('Error creating manual task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {createGoal,getAllGoals,getGoalById,updateGoal,updateDailyTaskStatus,updateWeeklyTaskStatus,updateMonthlyTaskStatus,getDailyTasks
  ,getWeeklyTasks,getMonthlyTasks,deleteGoal,getGoalStats,addManualTask
};