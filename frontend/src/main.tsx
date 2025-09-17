import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import Landing from './pages/Landing';
import './index.css';
import './i18n';

const queryClient = new QueryClient();

function Root() {
	const [started, setStarted] = useState(false);
	return started ? <App /> : <Landing onStart={()=>setStarted(true)} />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<Root />
		</QueryClientProvider>
	</React.StrictMode>
);
