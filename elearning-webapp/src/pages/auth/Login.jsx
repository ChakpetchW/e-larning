import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UserCircle, ShieldAlert } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/user/home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { authAPI } = await import('../../utils/api');
      const response = await authAPI.login(email, password);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const userRole = response.data.user.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="card w-full max-w-sm p-8 flex flex-col items-center bg-white/80 backdrop-blur-xl border border-white shadow-2xl relative z-10">
        
        <div className="bg-gradient-primary text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-black mb-1 text-center tracking-tight text-gray-900">LMS Connect</h1>
        <p className="text-gray-500 font-medium text-sm text-center mb-8">e-Learning ระบบพัฒนาบุคลากร</p>

        <form onSubmit={handleLogin} className="w-full flex-col flex gap-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">อีเมล / รหัสพนักงาน</label>
            <input 
              type="text" 
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 w-full transition-all text-sm font-medium" 
              placeholder="employee@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">รหัสผ่าน</label>
            <input 
              type="password" 
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 w-full transition-all text-sm font-medium" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4 py-3.5 justify-center text-[15px] shadow-lg shadow-primary/20 rounded-xl font-bold disabled:opacity-70">
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-xs text-gray-400 font-medium mt-8 text-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          v1.0 MVP
        </p>
      </div>
    </div>
  );
};

export default Login;
