import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ScrollToTop from './utilities/ScrollToTop';
import { Toaster } from "@/components/ui/sonner";
import AuthLayout from './components/Auth/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './components/Entrance/LandingPage';
import DashBoard from './pages/UserPages/DashBoard';
import TaskLayout from './components/User/TaskLayout';
import CheckAuth from './components/common/CheckAuth';
import UserProfile from './pages/UserPages/UserProfile';
import AddTask from './pages/UserPages/AddTask';
import ManualTask from './pages/UserPages/ManualTask';
import NotFound from './pages/auth/NotFound';
import UserHome from './pages/UserPages/UserHome';
import GoalDetail from './pages/UserPages/GoalDetail';
import SetNewPassword from './pages/UserPages/SetNewPassword';
import TermsOfService from './components/common/TermsOfService';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import UserFeedBack from './pages/UserPages/UserFeedBack';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashBoard from './pages/AdminPages/AdminDashBoard';
import Reviews from './pages/AdminPages/Reviews';
import AdminProfile from './pages/AdminPages/AdminProfile';
import UsersTaskStatistics from './pages/AdminPages/UsersTaskStatistics';
import LoadingSpinner from './utilities/LoadingSpinner';
import { useAuthInitialize } from './utilities/hooks/useAuthInitialize';
import AdminTestimonials from './pages/AdminPages/AdminTestimonials';
import RecentLogins from './pages/AdminPages/RecentLogins';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';
import CandyCrushGoalMap from './pages/UserPages/CandyCrushGoalMap';
import ScanResume from './pages/UserPages/ScanResume';
const App = () => {
  const { isLoading: authInitLoading } = useAuthInitialize();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (authInitLoading || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <ScrollToTop />
      <CheckAuth isAuthenticated={isAuthenticated} user={user}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path='privacy-policy' element={<PrivacyPolicy/>} />
          <Route path='terms-service' element={<TermsOfService/>} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path='forgot-password' element={<ForgotPassword/>}/>
            <Route path='change-password' element={<ChangePassword/>}/>
          </Route>
          <Route path="/user" element={<TaskLayout />}>
            <Route path="add-task" element={<AddTask />} />
            <Route path="dashboard" element={<DashBoard />} />
            <Route path='home' element={<UserHome/>} />
            <Route path='profile' element={<UserProfile/>} />
            <Route path='add-manual' element={<ManualTask/>} />
            <Route path="goal/:goalId" element={<GoalDetail />} />
            <Route path='set-new-password' element={<SetNewPassword/>} />
            <Route path='feedback' element={<UserFeedBack/>} />
            <Route path="goal/:goalId/map" element={<CandyCrushGoalMap />} />
            <Route path='check-resume' element={<ScanResume/>}/>
          </Route>
            <Route path='/admin' element={<AdminLayout/>}>
              <Route path='dashboard' element={<AdminDashBoard/>} />
              <Route path='users' element={<UsersTaskStatistics/>} />
              <Route path='reviews' element={<Reviews/>} />
              <Route path='set-testimonials' element={<AdminTestimonials/>} />
              <Route path='profile' element={<AdminProfile/>} />
              <Route path='recent-logins' element={<RecentLogins/>}/>
              <Route />
              <Route path='set-new-password' element={<SetNewPassword/>}/>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </CheckAuth>
    </div>
  );
};

export default App;
          