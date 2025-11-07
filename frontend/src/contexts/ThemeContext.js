import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
	default: {
		id: 'default',
		name: 'Default',
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
		darkColors: {
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
	amber: {
		id: 'amber',
		name: 'Sunset Amber',
		colors: {
			background: 'bg-amber-50',
			card: 'bg-white',
			text: 'text-amber-900',
			textSecondary: 'text-amber-700',
			border: 'border-amber-200',
			hover: 'hover:bg-amber-100',
			primary: 'bg-amber-600',
			primaryHover: 'hover:bg-amber-700',
		},
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-amber-100',
			textSecondary: 'text-amber-300',
			border: 'border-amber-900',
			hover: 'hover:bg-slate-700',
			primary: 'bg-amber-600',
			primaryHover: 'hover:bg-amber-700',
		},
	},
	rose: {
		id: 'rose',
		name: 'Cherry Rose',
		colors: {
			background: 'bg-rose-50',
			card: 'bg-white',
			text: 'text-rose-900',
			textSecondary: 'text-rose-700',
			border: 'border-rose-200',
			hover: 'hover:bg-rose-100',
			primary: 'bg-rose-600',
			primaryHover: 'hover:bg-rose-700',
		},
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-rose-100',
			textSecondary: 'text-rose-300',
			border: 'border-rose-900',
			hover: 'hover:bg-slate-700',
			primary: 'bg-rose-600',
			primaryHover: 'hover:bg-rose-700',
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
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-blue-100',
			textSecondary: 'text-blue-300',
			border: 'border-blue-900',
			hover: 'hover:bg-slate-700',
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
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-purple-100',
			textSecondary: 'text-purple-300',
			border: 'border-purple-900',
			hover: 'hover:bg-slate-700',
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
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-green-100',
			textSecondary: 'text-green-300',
			border: 'border-green-900',
			hover: 'hover:bg-slate-700',
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
		darkColors: {
			background: 'bg-slate-900',
			card: 'bg-slate-800',
			text: 'text-slate-100',
			textSecondary: 'text-slate-400',
			border: 'border-slate-700',
			hover: 'hover:bg-slate-700',
			primary: 'bg-slate-600',
			primaryHover: 'hover:bg-slate-700',
		},
	},
};

export const ThemeProvider = ({ children }) => {
	const [currentTheme, setCurrentTheme] = useState('default');
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

	// Get the appropriate theme based on dark mode and current theme
	const getTheme = () => {
		const selectedTheme = themes[currentTheme];
		if (isDarkMode) {
			// Return dark variant of the current theme
			return {
				...selectedTheme,
				colors: selectedTheme.darkColors,
			};
		}
		return selectedTheme;
	};

	const theme = getTheme();

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
