import { randomColor } from '/src/utils/common-utils';

export const THEMES = {
	classic: {
		name: 'classic',
		backgroundColor: '#000',
		cellColor: '#000',
		cellBorderColor: '#000',
		snakeColor: '#0f0',
		appleColor: '#f00',
		clearColor: '#000',
		borderRadius: '0px',
		boxShadow: 'none',
		isClassic: true
	},
	theme_1: {
		name: 'theme_1',
		backgroundColor: '#030',
		cellColor: '#770',
		cellBorderColor: '#770',
		snakeColor: '#0f0',
		appleColor: '#f00',
		clearColor: '#770',
		borderRadius: '7px',
		boxShadow: '0px 0px 5px #fff',
		random: `${randomColor()}`,
		isClassic: false
	},
};