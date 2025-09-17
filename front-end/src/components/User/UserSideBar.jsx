import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Home,
  BarChart3,
  TrendingUp,
  User,
  Target,
  LogOut,
  Plus,
  CheckCircle,
  Clock,
  MessageSquare,FileScan
} from 'lucide-react';
import { logoutUser } from '@/store/auth';
import { getGoalStats } from '@/store/task';
import { toast } from 'sonner';

const UserSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await dispatch(getGoalStats({ user }));
      if (response.payload?.success) {
        setStats(response.payload.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 30000); 

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleStatsUpdate = () => {
      fetchStats();
    };

    window.addEventListener('goalCompleted', handleStatsUpdate);
    window.addEventListener('goalAdded', handleStatsUpdate);
    window.addEventListener('goalUpdated', handleStatsUpdate);

    return () => {
      window.removeEventListener('goalCompleted', handleStatsUpdate);
      window.removeEventListener('goalAdded', handleStatsUpdate);
      window.removeEventListener('goalUpdated', handleStatsUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutUser());
      console.log(data.payload);
      if (data.payload.success) {
        toast.success(data.payload.message);
      } else {
        toast.error(data.payload.message);
      }
    } catch (err) {
      toast.error(`something went wrong ${err}`);
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Your tasks',
      path: '/user/home',
      description: 'Update status'
    },
    {
      icon: Plus,
      label: 'Add Task',
      path: '/user/add-task',
      description: 'Add new AI tasks'
    },
    {
      icon: BarChart3,
      label: 'Dashboard',
      path: '/user/dashboard',
      description: 'View analytics'
    },
      {
      icon: FileScan,
      label: 'Resume Check',
      path: '/user/check-resume',
      description: 'Check Resume Score'
    },
    {
      icon: MessageSquare,
      label: 'Feedback',
      path: '/user/feedback',
      description: 'Share feedback'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/user/profile',
      description: 'Manage account'
    }
  ];

  const isActivePath = (path) => location.pathname === path;

  const activeGoals = stats ? stats.totalGoals - stats.completedGoals : 0;
  
  const weeklyProgress = stats?.overallCompletionRate || 0;

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 z-40 flex-col justify-between">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={` cursor-pointer w-full group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-[#8FE877] text-white shadow-lg shadow-green-500/25 transform scale-[1.02]'
                    : 'text-gray-700 hover:text-green-500 hover:bg-green-500/5 hover:translate-x-1'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-green-500/10'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-green-500'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium text-sm ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1 h-6 bg-white/50 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-green-500/5 rounded-xl border border-gray-200/50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-500" />
            <span>Quick Stats</span>
          </h4>
          
          {statsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Active Goals
                </span>
                <span className="font-semibold text-green-500">{activeGoals}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
                <span className="font-semibold text-gray-900">{stats.completedGoals}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Progress
                </span>
                <span className={`font-semibold ${weeklyProgress > 0 ? 'text-[#8FE877]' : 'text-gray-500'}`}>
                  {weeklyProgress > 0 ? `${weeklyProgress}%` : '0%'}
                </span>
              </div>
              
              {weeklyProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-[#8FE877] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="text-xs text-gray-500">No data available</div>
              <button 
                onClick={() => navigate('/user/add-task')}
                className="text-xs text-green-500 hover:text-green-600 mt-1 font-medium"
              >
                Create your first goal
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center space-x-3 px-3 py-3 rounded-lg 
                    transition-all duration-300 text-red-700 
                    hover:text-red-500 hover:bg-red-500/5 hover:translate-x-1 cursor-pointer   text-xl"
        >
          <span>Logout</span>
          <LogOut />
        </button>
      </div>
    </aside>
  );
};

export default UserSideBar;