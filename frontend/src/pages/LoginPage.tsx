import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This is a placeholder for actual authentication logic
      // In a real implementation, this would call the backend API
      console.log('Logging in with:', { email, password });
      
      // Simulate successful login
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('user', JSON.stringify({ email }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="text-center">Welcome Back</h2>
          <p className="text-center mb-3">Sign in to access your memories</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary btn-block" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-social mt-3">
            <p className="text-center mb-2">Or sign in with</p>
            <div className="social-buttons">
              <button className="btn-social btn-google">
                Google
              </button>
              <button className="btn-social btn-facebook">
                Facebook
              </button>
            </div>
          </div>
          
          <div className="auth-footer mt-3">
            <p className="text-center">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
