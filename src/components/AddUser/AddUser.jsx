<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, clearError } from "../../Redux/userSlice";
import { addUserToList } from "../../Redux/umSlice";
=======
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../Redux/userSlice";
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
<<<<<<< HEAD
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle navigation after successful user creation
  useEffect(() => {
    if (shouldNavigate) {
      navigate("/");
    }
  }, [shouldNavigate, navigate]);

  // Validation Schema
=======

  //  Validation Schema
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
<<<<<<< HEAD
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      // Clear any previous errors
      dispatch(clearError());
      
      const newUser = await dispatch(addUser(values)).unwrap();
      
      // Update the user list in umSlice to keep it in sync
      dispatch(addUserToList(newUser));
      
      // Success - show success message and navigate
      console.log("User added successfully!");
      resetForm(); // Reset the form
      
      // Set flag to trigger navigation in useEffect
      setShouldNavigate(true);
      
    } catch (error) {
      // Handle specific error cases
      if (error.includes("already exists")) {
        setFieldError("email", "User already exists with this email");
      } else {
        console.error("Add user error:", error);
        // Don't use alert for errors, let the error state handle it
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
=======
  });

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add User</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/*Formik Form */}
      <Formik
        initialValues={{ name: "", email: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          dispatch(addUser(values))
            .unwrap()
            .then(() => {
              alert("User added successfully!");
              navigate("/");
            })
            .catch((err) => alert(err.message))
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting }) => (
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
          <Form className="space-y-4">
            <div>
              <Field
                type="text"
                name="name"
                placeholder="Enter Name"
<<<<<<< HEAD
                className={`w-full p-2 border rounded ${
                  errors.name && touched.name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
=======
                className="w-full p-2 border border-gray-300 rounded"
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
              />
              <ErrorMessage
                name="name"
                component="div"
<<<<<<< HEAD
                className="text-red-500 text-sm mt-1"
=======
                className="text-red-500 text-sm"
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
              />
            </div>

            <div>
              <Field
                type="email"
                name="email"
                placeholder="Enter Email"
<<<<<<< HEAD
                className={`w-full p-2 border rounded ${
                  errors.email && touched.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
=======
                className="w-full p-2 border border-gray-300 rounded"
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
              />
              <ErrorMessage
                name="email"
                component="div"
<<<<<<< HEAD
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                type="password"
                name="password"
                placeholder="Enter Password"
                className={`w-full p-2 border rounded ${
                  errors.password && touched.password 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

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
=======
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add User"}
            </button>
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
          </Form>
        )}
      </Formik>
    </div>
  );
};

<<<<<<< HEAD
export default AddUser;
=======
export default AddUser;
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
