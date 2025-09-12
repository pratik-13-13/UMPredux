import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, clearError,addUserToList } from "../../Store/Slices/userSlice";
//import { addUserToList } from "../../Redux/userSlice";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate after success
  useEffect(() => {
    if (shouldNavigate) {
      navigate("/");
    }
  }, [shouldNavigate, navigate]);

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      dispatch(clearError());

      const newUser = await dispatch(addUser(values)).unwrap();

      // Keep umSlice in sync
      dispatch(addUserToList(newUser));

      console.log("User added successfully!");
      resetForm();

      setShouldNavigate(true);
    } catch (error) {
      if (error.includes("already exists")) {
        setFieldError("email", "User already exists with this email");
      } else {
        console.error("Add user error:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10 bg-gray-50 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add User</h2>

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          Adding user...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formik Form */}
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            {/* Name Field */}
            <div>
              <Field
                type="text"
                name="name"
                placeholder="Enter Name"
                className={`w-full p-2 border rounded ${
                  errors.name && touched.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Email Field */}
            <div>
              <Field
                type="email"
                name="email"
                placeholder="Enter Email"
                className={`w-full p-2 border rounded ${
                  errors.email && touched.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Password Field */}
            <div>
              <Field
                type="password"
                name="password"
                placeholder="Enter Password"
                className={`w-full p-2 border rounded ${
                  errors.password && touched.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || loading ? "Adding..." : "Add User"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                disabled={isSubmitting || loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddUser;
