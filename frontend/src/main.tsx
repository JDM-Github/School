import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
// import ParticlesBackground from './components/particles.tsx';
import App from './App.tsx';
import { AuthProvider } from './context/auth.tsx';

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{/* <ParticlesBackground /> */}
		<BrowserRouter>
			<AuthProvider>
				<App />
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);

