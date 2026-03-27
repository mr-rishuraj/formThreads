import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: () => Promise<void>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin();
      // Redirect happens automatically via Supabase OAuth
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 h-screen flex items-center justify-center">
      <div className="w-[380px] bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl shadow-black/60">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 bg-amber-400 flex items-center justify-center text-black font-bold text-[11px] font-mono rounded-sm">FT</div>
            <span className="text-[14px] font-semibold text-zinc-100">FormThread</span>
          </div>
          <h1 className="text-[18px] font-semibold text-zinc-100 leading-snug">Sign in to your workspace</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1.5">conversational forms · role-based access</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-4">
          <p className="text-[12px] text-zinc-500 leading-relaxed">
            Sign in with your Google account. Your role (admin or participant) is assigned automatically based on your account.
          </p>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-sm bg-rose-400/10 border border-rose-400/20">
              <p className="font-mono text-[10px] text-rose-400">{error}</p>
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-3
              px-4 py-3 rounded-sm border transition-all duration-150
              ${loading
                ? 'border-zinc-700 bg-zinc-800 cursor-not-allowed'
                : 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-600 active:scale-[.99]'
              }
            `}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="font-mono text-[11px] text-zinc-400">Redirecting to Google…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="text-[12px] font-medium text-zinc-300">Continue with Google</span>
              </>
            )}
          </button>

          <p className="font-mono text-[9px] text-zinc-700 text-center leading-relaxed">
            By continuing you agree to the Terms of Service.<br />
            Role is assigned based on your account.
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.8s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="7" cy="7" r="5.5" stroke="#52525b" strokeWidth="1.5" fill="none" />
    <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export default AuthPage;
