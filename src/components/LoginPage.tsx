//@ts-nocheck

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function LoginPage() {
      
  const { isLoggedIn, setIsLoggedIn, setAuthToken } = useAuth();
  const from = location.state?.from?.pathname || '/home';

  console.log("LoginPage component rendered");
  const navigate = useNavigate();
  const { authenticate } = useOkto();
  // const [authToken, setAuthToken] = useState();
  const BASE_URL = "https://sandbox-api.okto.tech";
  const OKTO_CLIENT_API = "";
 
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };
 
   const apiService = axios.create({
    baseURL: BASE_URL,
    headers: {
      "x-api-key": OKTO_CLIENT_API,
      "Content-Type": "application/json",
    },
  });
 
  const handleGoogleLogin = async (credentialResponse) => {
    console.log("Google login response:", credentialResponse);
    const idToken = credentialResponse.credential;
    console.log("google idtoken: ", idToken);
    authenticate(idToken, async (authResponse, error) => {
      if (authResponse) {
        console.log("auth token received", authToken);
        navigate("/home");
      }
      if (error) {
        console.error("Authentication error:", error);
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
}
export default LoginPage;
 