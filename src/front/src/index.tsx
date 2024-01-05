import 'bootstrap/dist/css/bootstrap.css';
import 'github-markdown-css';
import './style/style.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

const root = createRoot(document.getElementById('app'));
root.render(<App />);
