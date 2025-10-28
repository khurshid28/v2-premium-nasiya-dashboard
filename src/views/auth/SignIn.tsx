import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useUser } from "contexts/UserContext";

export default function SignIn(): JSX.Element {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const maxLen = 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setLoginError(null);
    setPasswordError(null);
    setAuthError(null);

    // Basic validation
    let hasError = false;
    if (!login || login.trim().length === 0) {
      setLoginError("Login is required");
      hasError = true;
    }
    if (!password || password.trim().length === 0) {
      setPasswordError("Password is required");
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);

    try {
      // Demo auth: simulate API response with user data
      // In a real app, this would be an API call to your authentication endpoint
      const mockUserResponse = {
        token: "demo-token-" + Date.now(),
        user: {
          id: 1,
          fullname: "Adela Parkson",
          phone: "+998901234567",
          image: null as string | null,
          role: "USER",
          work_status: "WORKING"
        }
      };

      // Store token and user data
      localStorage.setItem("token", mockUserResponse.token);
      setUser(mockUserResponse.user);
      
      // Navigate to admin default
      navigate("/admin/default");
    } catch (err) {
      setAuthError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] flex-col items-center"
      >
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h4>
        <p className="mb-6 ml-1 text-base text-gray-600">Enter your credentials</p>

        <label className="mb-2 block w-full">
          <span className="text-sm font-medium text-gray-700">Login</span>
          <input
            className={`mt-1 w-full rounded-md px-3 py-2 outline-none border ${
              loginError
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            }`}
            value={login}
            onChange={(e) => {
              setLogin(e.target.value.slice(0, maxLen));
              if (loginError) setLoginError(null);
            }}
            maxLength={maxLen}
            id="login"
            name="login"
            type="text"
            placeholder="Login"
          />
          {loginError ? (
            <p className="mt-1 text-xs text-red-500">{loginError}</p>
          ) : null}
        </label>

        <label className="mb-4 block w-full relative">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <div className="mt-1 relative">
            <input
              className={`w-full rounded-md px-3 py-2 pr-10 outline-none border ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.slice(0, maxLen));
                if (passwordError) setPasswordError(null);
              }}
              maxLength={maxLen}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {passwordError ? (
            <p className="mt-1 text-xs text-red-500">{passwordError}</p>
          ) : null}
        </label>
        {authError ? (
          <p className="mb-2 text-sm text-red-500">{authError}</p>
        ) : null}

        <button
          type="submit"
          disabled={!login || !password || isLoading}
          className={`linear mt-2 w-full rounded-xl py-[12px] text-base font-medium text-white transition duration-200 ${
            !login || !password || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand-500 hover:bg-brand-600"
          }`}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
