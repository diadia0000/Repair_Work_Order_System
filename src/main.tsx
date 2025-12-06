import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify';
import { awsConfig } from './config/aws-config';
import App from './App.tsx'
import './styles/globals.css'

Amplify.configure(awsConfig);
console.log('Amplify configured with:', awsConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

