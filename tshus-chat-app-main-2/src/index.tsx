import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import '@/common/config/setup';
import App from '@/App';
import reportWebVitals from '@/reportWebVitals';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ThemeContext from '@/common/context/theme-context';
import TshusProvider from '@/common/context/tshus-context';
import CallProvider from './common/context/call-context';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <TshusProvider>
      <ThemeContext>
        <CallProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<App/>} />
            </Routes>
          </Router>
        </CallProvider>
      </ThemeContext>
    </TshusProvider>
  </StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
