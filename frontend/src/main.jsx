import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/globals.css';
import './styles/login.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/employee-form.css';
import './styles/employee-table.css';
import './styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1A1A2E',
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
