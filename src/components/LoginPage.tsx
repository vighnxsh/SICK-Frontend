//@ts-nocheck
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOkto } from 'okto-sdk-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const { authenticate } = useOkto();
  const { isLoggedIn, setIsLoggedIn, setAuthToken } = useAuth();

  const from = location.state?.from?.pathname || '/home';

  const handleGoogleLogin = async (credentialResponse: any) => {
    console.log('Google login response:', credentialResponse);
    const idToken = credentialResponse.credential;
    
    authenticate(idToken, async (authResponse: any, error: any) => {
      if (authResponse) {
        console.log('Authentication check:', authResponse);
        setAuthToken(authResponse.auth_token);
        setIsLoggedIn(true);
        navigate(from, { replace: true });
      }
      if (error) {
        console.error('Authentication error:', error);
        setIsLoggedIn(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-lime-950 to-gray-900">
      <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-lime-500/30">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-600">Login</h1>
        {!isLoggedIn ? (
          <div className="flex justify-center">
          
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={(error) => {
                console.log('Login Failed', error);
                setIsLoggedIn(false);
              }}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
              width="300px"
            />
          </div>
        ) : (
          <div className="text-center text-lime-400 text-xl font-semibold">
            Already authenticated!
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage