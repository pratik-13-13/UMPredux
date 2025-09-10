import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser } from "../../Redux/userSlice.js";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));

      if (result.meta.requestStatus === "fulfilled") {
        const { user, token } = result.payload;
        
        localStorage.setItem("authToken", token);
        localStorage.setItem("userInfo", JSON.stringify(user));
        
        alert("Login Successful!");
        
        if (user.role === "admin") {
          navigate("/");
        } else if (user.role === "user") {
          navigate("/feed");
        } else {
          navigate("/feed");
        }
      } else {
        alert(result.payload || "Login failed. Try again!");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {/* Additional Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 sm:py-3 lg:py-4 px-4 rounded-lg text-white font-semibold text-sm sm:text-base transition-all duration-200 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 text-xs sm:text-sm text-center">{error}</p>
            </div>
          )}
        </form>

        {/* Register Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
