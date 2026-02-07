import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import store from './store/store.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            // Premium Glassmorphism Style
            className: 'backdrop-blur-md bg-white/30 border border-white/20 shadow-xl rounded-2xl',
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(236, 253, 245, 0.9)',
                border: '1px solid rgba(167, 243, 208, 0.5)',
                color: '#065f46'
              }
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(254, 242, 242, 0.9)',
                border: '1px solid rgba(254, 202, 202, 0.5)',
                color: '#991b1b'
              }
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)