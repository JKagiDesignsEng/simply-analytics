import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
	light: {
		id: 'light',
		name: 'Light',
		colors: {
			background: 'bg-gray-50',
			card: 'bg-white',
			text: 'text-gray-900',
			textSecondary: 'text-gray-600',
			border: 'border-gray-200',
			hover: 'hover:bg-gray-100',
			primary: 'bg-primary-600',
			primaryHover: 'hover:bg-primary-700',
		},
	},
	dark: {
		id: 'dark',
		name: 'Dark',
		colors: {
			background: 'bg-gray-900',
			card: 'bg-gray-800',
			text: 'text-gray-100',
			textSecondary: 'text-gray-400',
			border: 'border-gray-700',
			hover: 'hover:bg-gray-700',
			primary: 'bg-primary-600',
			primaryHover: 'hover:bg-primary-700',
		},
	},
	blue: {
		id: 'blue',
		name: 'Ocean Blue',
		colors: {
			background: 'bg-blue-50',
			card: 'bg-white',
			text: 'text-blue-900',
			textSecondary: 'text-blue-600',
			border: 'border-blue-200',
			hover: 'hover:bg-blue-100',
			primary: 'bg-blue-600',
			primaryHover: 'hover:bg-blue-700',
		},
	},
	purple: {
		id: 'purple',
		name: 'Royal Purple',
		colors: {
			background: 'bg-purple-50',
			card: 'bg-white',
			text: 'text-purple-900',
			textSecondary: 'text-purple-600',
			border: 'border-purple-200',
			hover: 'hover:bg-purple-100',
			primary: 'bg-purple-600',
			primaryHover: 'hover:bg-purple-700',
		},
	},
	green: {
		id: 'green',
		name: 'Forest Green',
		colors: {
			background: 'bg-green-50',
			card: 'bg-white',
			text: 'text-green-900',
			textSecondary: 'text-green-600',
			border: 'border-green-200',
			hover: 'hover:bg-green-100',
			primary: 'bg-green-600',
			primaryHover: 'hover:bg-green-700',
		},
	},
	slate: {
		id: 'slate',
		name: 'Slate Gray',
		colors: {
			background: 'bg-slate-100',
			card: 'bg-white',
			text: 'text-slate-900',
			textSecondary: 'text-slate-600',
			border: 'border-slate-200',
			hover: 'hover:bg-slate-200',
			primary: 'bg-slate-700',
			primaryHover: 'hover:bg-slate-800',
		},
	},
};

export const ThemeProvider = ({ children }) => {
	const [currentTheme, setCurrentTheme] = useState('light');
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Load theme from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem('simply-analytics-theme');
		const savedDarkMode = localStorage.getItem('simply-analytics-dark-mode');
		
		if (savedTheme && themes[savedTheme]) {
			setCurrentTheme(savedTheme);
		}
		
		if (savedDarkMode) {
			setIsDarkMode(savedDarkMode === 'true');
		}
	}, []);

	// Update localStorage and document class when theme changes
	useEffect(() => {
		localStorage.setItem('simply-analytics-theme', currentTheme);
		
		// Apply dark mode class to document
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [currentTheme, isDarkMode]);

	const setTheme = (themeId) => {
		if (themes[themeId]) {
			setCurrentTheme(themeId);
		}
	};

	const toggleDarkMode = () => {
		const newDarkMode = !isDarkMode;
		setIsDarkMode(newDarkMode);
		localStorage.setItem('simply-analytics-dark-mode', newDarkMode.toString());
	};

	const theme = isDarkMode && currentTheme !== 'dark' 
		? themes.dark 
		: themes[currentTheme];

	return (
		<ThemeContext.Provider
			value={{
				currentTheme,
				theme,
				themes,
				setTheme,
				isDarkMode,
				toggleDarkMode,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
