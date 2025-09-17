import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Home, BarChart3, User, Target, LogOut, Plus, CheckCircle, Clock, Edit, MessageSquare,FileScan } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { logoutUser } from '@/store/auth';
import { getGoalStats } from '@/store/task';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

const UserHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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

  const menuItems = [
    {
      icon: Home,
      label: 'Your tasks',
      path: '/user/home',
      description: 'Update status'
    },
    {
      icon: Plus,
      label: 'Add AI Task',
      path: '/user/add-task',
      description: 'Add new AI tasks'
    },
    {
      icon: Edit,
      label: 'Add Manual Task',
      path: '/user/add-manual',
      description: 'Add manual tasks'
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
      description: 'Share your thoughts'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/user/profile',
      description: 'Manage account'
    }
  ];

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

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  const isAITaskActive = location.pathname === '/user/add-task';
  const isManualTaskActive = location.pathname === '/user/add-manual';
  const isResumePageActive = location.pathname=='/user/check-resume'
  const activeGoals = stats ? stats.totalGoals - stats.completedGoals : 0;
  const weeklyProgress = stats?.overallCompletionRate || 0;

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center transform rotate-12">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">AI TaskFlow</span>
              <div className="text-xs text-green-500 font-medium">Powered by AI</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 relative">
            <a
              onClick={() => navigate('/user/add-task')}
              className={`transition duration-300 cursor-pointer px-2 py-1 ${
                isAITaskActive ? 'text-green-500 font-semibold' : 'text-gray-600 hover:text-green-500'
              }`}
            >
              AI task
            </a>
            <a
              onClick={() => navigate('/user/add-manual')}
              className={`transition duration-300 cursor-pointer px-2 py-1 ${
                isManualTaskActive ? 'text-green-500 font-semibold' : 'text-gray-600 hover:text-green-500'
              }`}
            >
              Manual Task
            </a>
            <a
              onClick={() => navigate('/user/check-resume')}
              className={`transition duration-300 cursor-pointer px-2 py-1 ${
                isResumePageActive ? 'text-green-500 font-semibold' : 'text-gray-600 hover:text-green-500'
              }`}
            >
              Resume Check
            </a>
            <button
              className="bg-gradient-to-br from-green-500 cursor-pointer to-green-600 hover:from-[#8FE877] hover:to-green-500 text-white font-bold w-10 h-10 rounded-full transition-all duration-200 text-sm flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ring-2 ring-white/20"
              onClick={() => navigate('/user/profile')}
            >
              {user && user.userName?.[0]?.toUpperCase()}
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="bg-gradient-to-br from-green-500 to-green-600 hover:from-[#8FE877] hover:to-green-500 text-white font-bold w-10 h-10 rounded-full transition-all duration-200 text-sm flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ring-2 ring-white/20">
                  {user && user.userName?.[0]?.toUpperCase()}
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] bg-white border-l border-green-100 z-[70] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:duration-300 data-[state=closed]:duration-300"
              >
                <SheetHeader className="pb-6 border-b border-green-100 flex-shrink-0">
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{user && user.userName}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                  <nav className="flex flex-col gap-4 mt-6">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                            isActive
                              ? 'bg-green-500/10 text-green-600 font-semibold'
                              : 'text-gray-700 hover:text-green-500 hover:bg-green-500/5'
                          }`}
                        >
                          <div className="p-2 bg-green-500/10 rounded-md">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-green-500'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>Quick Stats</span>
                    </h4>
                    
                    {statsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : stats ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Active Goals
                          </span>
                          <span className="font-semibold text-green-500">{activeGoals}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                          <span className="font-semibold text-gray-900">{stats.completedGoals}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Progress
                          </span>
                          <span className={`font-semibold ${weeklyProgress > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                            {weeklyProgress > 0 ? `${weeklyProgress}%` : '0%'}
                          </span>
                        </div>
                        
                        {weeklyProgress > 0 && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="text-xs text-gray-500 mb-1">No data available</div>
                        <button 
                          onClick={() => handleNavigation('/user/add-task')}
                          className="text-xs text-green-500 hover:text-green-600 font-medium"
                        >
                          Create your first goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 border-t border-green-100 pt-4">
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-700 hover:text-red-500 hover:bg-red-50 group"
                    onClick={handleLogout}
                  >
                    <div className="p-2 bg-red-50 group-hover:bg-red-100 rounded-md transition-colors">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Logout</div>
                      <div className="text-xs text-gray-500">Sign out of your account</div>
                    </div>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;