// @ts-nocheck
import React, { useState } from "react";
import { useOkto } from "okto-sdk-react";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

function OktoAuthButton() {
  const { authenticate, logOut } = useOkto();
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        authenticate(response.access_token, (result, error) => {
          if (result) {
            setUser(result);
          }
          if (error) {
            console.error("Authentication error:", error);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      setIsLoading(false);
    },
  });

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={user ? handleLogout : handleGoogleLogin}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-full
        text-base font-medium
        transition-colors duration-200 ease-in-out
        ${user
          ? 'bg-gray-800 hover:bg-gray-700 hover:shadow-blue-300 transition-shadow duration-300'
            : 'bg-gradient-to-r from-blue-700 to-indigo-600 hover:to-indigo-700 hover:from-blue-600 hover:shadow-blue-500/30 shadow-xl transition-all duration-300'}
        text-white
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        shadow-md hover:shadow-lg
      `}
    >
      {isLoading ? (
        <span className="">loading...</span> 
      ) : (
        user ? 'Sign Out' : 'Sign In with Okto'
      )}
    </button>
  );
}

export default OktoAuthButton;
