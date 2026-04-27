import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SWRConfig } from 'swr';
import { api } from './api/axiosClient';

import 'primereact/resources/themes/lara-light-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';
import {AppProvider} from "./context/AppContext.tsx";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
            <AppProvider>
                <SWRConfig value={{ fetcher }}>
                    <App />
                </SWRConfig>
            </AppProvider>
    </React.StrictMode>
);
