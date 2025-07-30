import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<string | true>;
}

const AnimatedShape: React.FC<{style: React.CSSProperties, type: 'cube' | 'plane'}> = ({style, type}) => {
  if (type === 'plane') {
    return <div className="shape plane" style={style}></div>;
  }
  
  const size = parseInt(style.width as string) / 2;
  const faceStyle = {'--size': `${size}px`} as React.CSSProperties;

  return (
    <div className="shape cube" style={style}>
      <div className="face front" style={{...faceStyle, width: style.width, height: style.height}}></div>
      <div className="face back" style={{...faceStyle, width: style.width, height: style.height}}></div>
      <div className="face right" style={{...faceStyle, width: style.width, height: style.height}}></div>
      <div className="face left" style={{...faceStyle, width: style.width, height: style.height}}></div>
      <div className="face top" style={{...faceStyle, width: style.width, height: style.height}}></div>
      <div className="face bottom" style={{...faceStyle, width: style.width, height: style.height}}></div>
    </div>
  )
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);

    if (result !== true) {
      switch (result) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/invalid-credential':
          setError('Login failed. Please ask admin for login permission.');
          break;
        default:
          setError('Login failed. Please ask admin for login permission.');
          break;
      }
      setPassword(''); // Clear password field on failure
    }
  };
  
  const shapes = [
    { type: 'cube' as const, style: { width: '80px', height: '80px', top: '15%', left: '10%', animationDuration: '25s', animationDelay: '0s' }},
    { type: 'plane' as const, style: { width: '150px', height: '100px', top: '50%', left: '80%', animationDuration: '35s', animationDelay: '-5s' }},
    { type: 'cube' as const, style: { width: '40px', height: '40px', top: '80%', left: '5%', animationDuration: '22s', animationDelay: '-7s' }},
    { type: 'plane' as const, style: { width: '200px', height: '2px', top: '60%', left: '15%', animationDuration: '40s', animationDelay: '-10s' }},
    { type: 'cube' as const, style: { width: '60px', height: '60px', top: '5%', left: '70%', animationDuration: '30s', animationDelay: '-2s' }},
    { type: 'plane' as const, style: { width: '120px', height: '180px', top: '20%', left: '45%', animationDuration: '28s', animationDelay: '-15s' }},
    { type: 'plane' as const, style: { width: '2px', height: '150px', top: '85%', left: '90%', animationDuration: '26s', animationDelay: '-20s' }},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex items-center justify-center p-4 font-sans overflow-hidden relative">
      
      <div className="animation-container">
        {shapes.map((s, i) => <AnimatedShape key={i} type={s.type} style={s.style} />)}
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl shadow-blue-500/20 border border-blue-500/30 p-8 transition-all duration-500">
        
        <div className="flex justify-center mb-4">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
                <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="12" y1="17" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                 <linearGradient id="paint2_linear" x1="12" y1="12" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
          Layout Navigator
        </h1>
        <p className="text-center text-blue-400/80 mb-8">Sign in to continue</p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="relative mb-6">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full bg-transparent border-b-2 border-gray-500 text-white rounded-none p-3 focus:ring-0 focus:border-blue-500 outline-none transition duration-200"
              placeholder=" " 
              required
              autoComplete="email"
              autoFocus
            />
             <label htmlFor="email" className="absolute left-3 -top-3.5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-blue-400 peer-focus:text-sm pointer-events-none">
              Email
            </label>
          </div>
          
          <div className="relative mb-8">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full bg-transparent border-b-2 border-gray-500 text-white rounded-none p-3 focus:ring-0 focus:border-blue-500 outline-none transition duration-200"
              placeholder=" "
              required
              autoComplete="current-password"
            />
            <label htmlFor="password" className="absolute left-3 -top-3.5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-blue-400 peer-focus:text-sm pointer-events-none">
              Password
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-center text-sm mb-4 bg-red-500/10 py-2 rounded-lg">{error}</p>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transform hover:-translate-y-1 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;