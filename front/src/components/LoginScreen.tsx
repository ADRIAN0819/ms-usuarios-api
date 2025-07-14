import React from "react";
import PasswordInput from "./PasswordInput";
import type { LoginScreenProps } from "../types";

// Icons
const Icons = {
  Lightning: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  User: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Lock: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  Shield: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
};

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="inline-flex items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
  </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({
  userId,
  setUserId,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  loading,
  setCurrentView,
  setResponse,
  response,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 shadow-2xl border border-white/10">
        {/* Back to Landing button */}
        <div className="mb-4">
          <button
            onClick={() => {
              setResponse(""); // Clear any previous messages
              setCurrentView("landing");
            }}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            ← Back to TechStore
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Icons.Lightning />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TechStore</h1>
          <p className="text-slate-400 text-sm">
            Sistema de Gestión Multi-Tenant
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
              <Icons.User />
            </div>
            <input
              type="text"
              placeholder="ID de Usuario (ej: juan123)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Contraseña (mínimo 6 caracteres)"
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
            focusColor="focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <LoadingSpinner /> : <Icons.Shield />}
            {loading ? "Verificando credenciales..." : "Iniciar Sesión"}
          </button>

          <button
            onClick={() => {
              setResponse(""); // Clear any previous messages
              setCurrentView("register");
            }}
            className="w-full bg-white/5 text-white py-3 px-4 rounded-xl font-medium border border-white/20 hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Icons.User />
            Create Account
          </button>
        </div>

        {/* Response Messages */}
        {response && (
          <div
            className={`border rounded-xl p-4 backdrop-blur-sm transition-all duration-300 ${
              response.includes("exitoso") ||
              response.includes("bienvenido") ||
              response.includes("correcta")
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                  response.includes("exitoso") ||
                  response.includes("bienvenido") ||
                  response.includes("correcta")
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {response.includes("exitoso") ||
                response.includes("bienvenido") ||
                response.includes("correcta") ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    response.includes("exitoso") ||
                    response.includes("bienvenido") ||
                    response.includes("correcta")
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {(() => {
                    try {
                      const parsed = JSON.parse(response);
                      return parsed.mensaje || "Error de autenticación";
                    } catch {
                      return response;
                    }
                  })()}
                </p>
                {!response.includes("exitoso") &&
                  !response.includes("bienvenido") &&
                  !response.includes("correcta") && (
                    <p className="text-slate-400 text-xs mt-1">
                      Verifica que tus credenciales sean correctas e intenta
                      nuevamente.
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default LoginScreen;
