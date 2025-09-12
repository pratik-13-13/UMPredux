import { createRoot } from 'react-dom/client';
import './Styles/index.css';
import App from './App.jsx';
import React, { StrictMode } from 'react';
import { Provider } from 'react-redux';
import store from './Store/store.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>  {/* ✅ Fix applied here */}
        <App />
    </Provider>
  </StrictMode>
);
