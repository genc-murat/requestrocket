<script lang="ts" context="module">
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";
  
    type ThemeProperties = {
      [key: string]: string;
    };
  
    const themes: { [key: string]: ThemeProperties } = {
      default: {
        '--background': '#f5f5f5',
        '--light-background': '#ffffff',
        '--surface': '#eeeeee',
        '--primary-text': '#31363f',
        '--secondary-text': '#dde6ed',
        '--dark-text': '#111111',
        '--divider': '#dde6ed',
        '--shadow': 'rgba(0, 0, 0, 0.25)',
        '--primary': '#526d82',
        '--secondary': '#9db2bf',
        '--warning': '#ffd966',
        '--error': '#f28b82',
        '--info': '#7ea8d7',
        '--success': '#90c695',
        '--dropdown-box-shadow': 'rgba(162, 206, 209, 0.7)',
        '--group-card-hover': '#f0f0f0',
        '--seperator': '#cccccc',
        '--select-background-color': '#f3f4f6',
        '--select-text-color': '#374151',
        '--select-focus-border-color': '#2563eb',
        '--select-focus-box-shadow': 'rgba(37, 99, 235, 0.3)'
      },
      darkTheme: {
        '--background': '#1a1a1a',
        '--light-background': '#2e2e2e',
        '--surface': '#333333',
        '--primary-text': '#e0e0e0',
        '--secondary-text': '#b0b0b0',
        '--dark-text': '#ffffff',
        '--divider': '#555555',
        '--shadow': 'rgba(0, 0, 0, 0.5)',
        '--primary': '#3a6ea5',
        '--secondary': '#9eb3c2',
        '--warning': '#e9c46a',
        '--error': '#e76f51',
        '--info': '#64a3f7',
        '--success': '#81c784',
        '--dropdown-box-shadow': 'rgba(58, 110, 165, 0.7)',
        '--group-card-hover': '#404040',
        '--seperator': '#666666',
        '--select-background-color': '#3b3b3b',
        '--select-text-color': '#d1d5db',
        '--select-focus-border-color': '#2563eb',
        '--select-focus-box-shadow': 'rgba(37, 99, 235, 0.5)'
      },
      lightBlueTheme: {
        '--background': '#e0f7fa',
        '--light-background': '#ffffff',
        '--surface': '#b2ebf2',
        '--primary-text': '#004d40',
        '--secondary-text': '#00796b',
        '--dark-text': '#00251a',
        '--divider': '#80deea',
        '--shadow': 'rgba(0, 77, 64, 0.25)',
        '--primary': '#00796b',
        '--secondary': '#004d40',
        '--warning': '#ffb74d',
        '--error': '#e57373',
        '--info': '#64b5f6',
        '--success': '#81c784',
        '--dropdown-box-shadow': 'rgba(0, 121, 107, 0.7)',
        '--group-card-hover': '#b2dfdb',
        '--seperator': '#80cbc4',
        '--select-background-color': '#e0f2f1',
        '--select-text-color': '#004d40',
        '--select-focus-border-color': '#00796b',
        '--select-focus-box-shadow': 'rgba(0, 121, 107, 0.3)'
      },
      creamTheme: {
        '--background': '#f0f0e9',
        '--light-background': '#ffffff',
        '--surface': '#d9d9d1',
        '--primary-text': '#4e4e4e',
        '--secondary-text': '#7d7d7d',
        '--dark-text': '#1c1c1c',
        '--divider': '#bfbfbf',
        '--shadow': 'rgba(76, 76, 76, 0.25)',
        '--primary': '#8c7b75',
        '--secondary': '#b29e96',
        '--warning': '#f4a261',
        '--error': '#e76f51',
        '--info': '#6d9eeb',
        '--success': '#9acd32',
        '--dropdown-box-shadow': 'rgba(140, 123, 117, 0.7)',
        '--group-card-hover': '#ece5e0',
        '--seperator': '#ccc5be',
        '--select-background-color': '#ebe7e2',
        '--select-text-color': '#4e4e4e',
        '--select-focus-border-color': '#8c7b75',
        '--select-focus-box-shadow': 'rgba(140, 123, 117, 0.3)'
      },
      neutralTheme: {
      '--background': '#f5f5f5',
      '--light-background': '#ffffff',
      '--surface': '#e0e0e0',
      '--primary-text': '#212121',
      '--secondary-text': '#757575',
      '--dark-text': '#000000',
      '--divider': '#bdbdbd',
      '--shadow': 'rgba(33, 33, 33, 0.25)',
      '--primary': '#3f51b5',
      '--secondary': '#ff4081',
      '--warning': '#ffa000',
      '--error': '#d32f2f',
      '--info': '#1976d2',
      '--success': '#388e3c',
      '--dropdown-box-shadow': 'rgba(63, 81, 181, 0.7)',
      '--group-card-hover': '#e8eaf6',
      '--seperator': '#c5cae9',
      '--select-background-color': '#f5f5f5',
      '--select-text-color': '#212121',
      '--select-focus-border-color': '#3f51b5',
      '--select-focus-box-shadow': 'rgba(63, 81, 181, 0.3)'
    },
    blueSkyTheme : {
      '--background': '#e3f2fd',
      '--light-background': '#ffffff',
      '--surface': '#bbdefb',
      '--primary-text': '#0d47a1',
      '--secondary-text': '#5472d3',
      '--dark-text': '#002171',
      '--divider': '#90caf9',
      '--shadow': 'rgba(13, 71, 161, 0.25)',
      '--primary': '#1e88e5',
      '--secondary': '#64b5f6',
      '--warning': '#ffca28',
      '--error': '#e53935',
      '--info': '#29b6f6',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(30, 136, 229, 0.7)',
      '--group-card-hover': '#e1f5fe',
      '--seperator': '#b3e5fc',
      '--select-background-color': '#e3f2fd',
      '--select-text-color': '#0d47a1',
      '--select-focus-border-color': '#1e88e5',
      '--select-focus-box-shadow': 'rgba(30, 136, 229, 0.3)'
    },
    darkGrayNeonTheme: {
      '--background': '#2c2c2c',
      '--light-background': '#3d3d3d',
      '--surface': '#4a4a4a',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#b0b0b0',
      '--dark-text': '#ffffff',
      '--divider': '#616161',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#8e24aa',
      '--secondary': '#d81b60',
      '--warning': '#ffa726',
      '--error': '#e53935',
      '--info': '#29b6f6',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(142, 36, 170, 0.7)',
      '--group-card-hover': '#424242',
      '--seperator': '#757575',
      '--select-background-color': '#3d3d3d',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#8e24aa',
      '--select-focus-box-shadow': 'rgba(142, 36, 170, 0.3)'
    },
    neonGreenTheme: {
      '--background': '#0d0d0d',
      '--light-background': '#1a1a1a',
      '--surface': '#262626',
      '--primary-text': '#ffffff',
      '--secondary-text': '#a1a1a1',
      '--dark-text': '#e0e0e0',
      '--divider': '#333333',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#00ff7f',
      '--secondary': '#ff00ff',
      '--warning': '#ffea00',
      '--error': '#ff1744',
      '--info': '#00e5ff',
      '--success': '#76ff03',
      '--dropdown-box-shadow': 'rgba(0, 255, 127, 0.7)',
      '--group-card-hover': '#1f1f1f',
      '--seperator': '#404040',
      '--select-background-color': '#1a1a1a',
      '--select-text-color': '#ffffff',
      '--select-focus-border-color': '#00ff7f',
      '--select-focus-box-shadow': 'rgba(0, 255, 127, 0.3)'
    },
    rainbowTheme: {
      '--background': '#000000',
      '--light-background': '#1a1a1a',
      '--surface': '#262626',
      '--primary-text': '#ffffff',
      '--secondary-text': '#a1a1a1',
      '--dark-text': '#e0e0e0',
      '--divider': '#333333',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#ff0000',
      '--secondary': '#ff7f00',
      '--tertiary': '#ffff00',
      '--quaternary': '#00ff00',
      '--quinary': '#0000ff',
      '--senary': '#4b0082',
      '--septenary': '#8b00ff',
      '--warning': '#ffa726',
      '--error': '#ff1744',
      '--info': '#00e5ff',
      '--success': '#76ff03',
      '--dropdown-box-shadow': 'rgba(255, 0, 0, 0.7)',
      '--group-card-hover': '#1f1f1f',
      '--seperator': '#404040',
      '--select-background-color': '#1a1a1a',
      '--select-text-color': '#ffffff',
      '--select-focus-border-color': '#ff0000',
      '--select-focus-box-shadow': 'rgba(255, 0, 0, 0.3)'
    },
    darkTurquoiseTheme: {
      '--background': '#121212',
      '--light-background': '#1e1e1e',
      '--surface': '#2c2c2c',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#bdbdbd',
      '--dark-text': '#ffffff',
      '--divider': '#484848',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#00bcd4',
      '--secondary': '#ff4081',
      '--tertiary': '#ffea00',
      '--quaternary': '#76ff03',
      '--warning': '#ffab00',
      '--error': '#ff5252',
      '--info': '#40c4ff',
      '--success': '#69f0ae',
      '--dropdown-box-shadow': 'rgba(0, 188, 212, 0.7)',
      '--group-card-hover': '#1e1e1e',
      '--seperator': '#484848',
      '--select-background-color': '#2c2c2c',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#00bcd4',
      '--select-focus-box-shadow': 'rgba(0, 188, 212, 0.3)'
    },
    darkBlueTheme: {
      '--background': '#0b0c10',
      '--light-background': '#1f2833',
      '--surface': '#2c3e50',
      '--primary-text': '#c5c6c7',
      '--secondary-text': '#66fcf1',
      '--dark-text': '#ffffff',
      '--divider': '#45a29e',
      '--shadow': 'rgba(11, 12, 16, 0.7)',
      '--primary': '#66fcf1',
      '--secondary': '#45a29e',
      '--warning': '#f39c12',
      '--error': '#e74c3c',
      '--info': '#3498db',
      '--success': '#2ecc71',
      '--dropdown-box-shadow': 'rgba(102, 252, 241, 0.7)',
      '--group-card-hover': '#1f2833',
      '--seperator': '#34495e',
      '--select-background-color': '#1f2833',
      '--select-text-color': '#c5c6c7',
      '--select-focus-border-color': '#66fcf1',
      '--select-focus-box-shadow': 'rgba(102, 252, 241, 0.3)'
    },
    pinkFuchsiaTheme: {
      '--background': '#1a1a1a',
      '--light-background': '#2e2e2e',
      '--surface': '#3e3e3e',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#ff00ff',
      '--dark-text': '#ffffff',
      '--divider': '#ff69b4',
      '--shadow': 'rgba(26, 26, 26, 0.7)',
      '--primary': '#ff00ff',
      '--secondary': '#ff69b4',
      '--warning': '#ffb74d',
      '--error': '#ff1744',
      '--info': '#1e90ff',
      '--success': '#32cd32',
      '--dropdown-box-shadow': 'rgba(255, 0, 255, 0.7)',
      '--group-card-hover': '#2e2e2e',
      '--seperator': '#ff69b4',
      '--select-background-color': '#2e2e2e',
      '--select-text-color': '#ff00ff',
      '--select-focus-border-color': '#ff00ff',
      '--select-focus-box-shadow': 'rgba(255, 0, 255, 0.3)'
    },
    coralTheme: {
      '--background': '#ff6f61',
      '--light-background': '#ffe6e1',
      '--surface': '#ffcccb',
      '--primary-text': '#4e342e',
      '--secondary-text': '#795548',
      '--dark-text': '#3e2723',
      '--divider': '#ffab91',
      '--shadow': 'rgba(255, 111, 97, 0.5)',
      '--primary': '#ff5722',
      '--secondary': '#ff8a65',
      '--warning': '#ffa726',
      '--error': '#e53935',
      '--info': '#4fc3f7',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(255, 87, 34, 0.7)',
      '--group-card-hover': '#ffab91',
      '--seperator': '#ffcccb',
      '--select-background-color': '#ffe6e1',
      '--select-text-color': '#4e342e',
      '--select-focus-border-color': '#ff5722',
      '--select-focus-box-shadow': 'rgba(255, 87, 34, 0.3)'
    },
    acidGreenTheme: {
      '--background': '#ccff00',
      '--light-background': '#e6ff80',
      '--surface': '#ccff99',
      '--primary-text': '#1b5e20',
      '--secondary-text': '#388e3c',
      '--dark-text': '#003300',
      '--divider': '#99cc00',
      '--shadow': 'rgba(204, 255, 0, 0.5)',
      '--primary': '#76ff03',
      '--secondary': '#64dd17',
      '--warning': '#ffd600',
      '--error': '#d50000',
      '--info': '#00b0ff',
      '--success': '#00c853',
      '--dropdown-box-shadow': 'rgba(118, 255, 3, 0.7)',
      '--group-card-hover': '#ccff99',
      '--seperator': '#ccff66',
      '--select-background-color': '#e6ff80',
      '--select-text-color': '#1b5e20',
      '--select-focus-border-color': '#76ff03',
      '--select-focus-box-shadow': 'rgba(118, 255, 3, 0.3)'
    },
    intensePurpleTheme: {
      '--background': '#2d0c57',
      '--light-background': '#3e165f',
      '--surface': '#563d7c',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#b0b0b0',
      '--dark-text': '#ffffff',
      '--divider': '#7851a9',
      '--shadow': 'rgba(45, 12, 87, 0.7)',
      '--primary': '#9c27b0',
      '--secondary': '#ba68c8',
      '--warning': '#fbc02d',
      '--error': '#e53935',
      '--info': '#1e88e5',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(156, 39, 176, 0.7)',
      '--group-card-hover': '#4a148c',
      '--seperator': '#7b1fa2',
      '--select-background-color': '#3e165f',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#9c27b0',
      '--select-focus-box-shadow': 'rgba(156, 39, 176, 0.3)'
    },
    brightOrangeTheme: {
      '--background': '#ff7043',
      '--light-background': '#ff8a65',
      '--surface': '#ffab91',
      '--primary-text': '#4e342e',
      '--secondary-text': '#6d4c41',
      '--dark-text': '#3e2723',
      '--divider': '#ffccbc',
      '--shadow': 'rgba(255, 112, 67, 0.5)',
      '--primary': '#ff5722',
      '--secondary': '#ff7043',
      '--warning': '#ffeb3b',
      '--error': '#d32f2f',
      '--info': '#29b6f6',
      '--success': '#81c784',
      '--dropdown-box-shadow': 'rgba(255, 87, 34, 0.7)',
      '--group-card-hover': '#ff8a65',
      '--seperator': '#ffccbc',
      '--select-background-color': '#ffab91',
      '--select-text-color': '#4e342e',
      '--select-focus-border-color': '#ff5722',
      '--select-focus-box-shadow': 'rgba(255, 87, 34, 0.3)'
    },
    darkGreenTheme: {
      '--background': '#0a0f0d',
      '--light-background': '#1b2a23',
      '--surface': '#2e3d35',
      '--primary-text': '#d1e8e4',
      '--secondary-text': '#a7d4cb',
      '--dark-text': '#e0f2f1',
      '--divider': '#4b615c',
      '--shadow': 'rgba(10, 15, 13, 0.7)',
      '--primary': '#26a69a',
      '--secondary': '#80cbc4',
      '--warning': '#ffab00',
      '--error': '#d50000',
      '--info': '#29b6f6',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(38, 166, 154, 0.7)',
      '--group-card-hover': '#1b2a23',
      '--seperator': '#4b615c',
      '--select-background-color': '#2e3d35',
      '--select-text-color': '#d1e8e4',
      '--select-focus-border-color': '#26a69a',
      '--select-focus-box-shadow': 'rgba(38, 166, 154, 0.3)'
    },
    deepPurpleTheme: {
      '--background': '#1c0b19',
      '--light-background': '#2e1b29',
      '--surface': '#4a3a4f',
      '--primary-text': '#e0dfe5',
      '--secondary-text': '#bdb8c2',
      '--dark-text': '#ffffff',
      '--divider': '#6c5a7e',
      '--shadow': 'rgba(28, 11, 25, 0.7)',
      '--primary': '#8e24aa',
      '--secondary': '#ba68c8',
      '--warning': '#ffab00',
      '--error': '#e53935',
      '--info': '#29b6f6',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(142, 36, 170, 0.7)',
      '--group-card-hover': '#2e1b29',
      '--seperator': '#6c5a7e',
      '--select-background-color': '#4a3a4f',
      '--select-text-color': '#e0dfe5',
      '--select-focus-border-color': '#8e24aa',
      '--select-focus-box-shadow': 'rgba(142, 36, 170, 0.3)'
    },
    darkBlackTheme: {
      '--background': '#0a0a0a',
      '--light-background': '#1c1c1c',
      '--surface': '#2e2e2e',
      '--primary-text': '#f5f5f5',
      '--secondary-text': '#bdbdbd',
      '--dark-text': '#ffffff',
      '--divider': '#4f4f4f',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#bb86fc',
      '--secondary': '#03dac6',
      '--warning': '#ffd600',
      '--error': '#cf6679',
      '--info': '#2196f3',
      '--success': '#4caf50',
      '--dropdown-box-shadow': 'rgba(187, 134, 252, 0.7)',
      '--group-card-hover': '#1c1c1c',
      '--seperator': '#4f4f4f',
      '--select-background-color': '#2e2e2e',
      '--select-text-color': '#f5f5f5',
      '--select-focus-border-color': '#bb86fc',
      '--select-focus-box-shadow': 'rgba(187, 134, 252, 0.3)'
    },
    darkNavyTheme: {
      '--background': '#001f3f',
      '--light-background': '#002f5f',
      '--surface': '#004080',
      '--primary-text': '#f0f8ff',
      '--secondary-text': '#b0c4de',
      '--dark-text': '#ffffff',
      '--divider': '#5f9ea0',
      '--shadow': 'rgba(0, 31, 63, 0.7)',
      '--primary': '#1e90ff',
      '--secondary': '#00ced1',
      '--warning': '#ffd700',
      '--error': '#ff4500',
      '--info': '#4682b4',
      '--success': '#32cd32',
      '--dropdown-box-shadow': 'rgba(30, 144, 255, 0.7)',
      '--group-card-hover': '#002f5f',
      '--seperator': '#5f9ea0',
      '--select-background-color': '#004080',
      '--select-text-color': '#f0f8ff',
      '--select-focus-border-color': '#1e90ff',
      '--select-focus-box-shadow': 'rgba(30, 144, 255, 0.3)'
    },
    solidBlackTheme: {
      '--background': '#000000',
      '--light-background': '#1a1a1a',
      '--surface': '#2e2e2e',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#bdbdbd',
      '--dark-text': '#ffffff',
      '--divider': '#4f4f4f',
      '--shadow': 'rgba(0, 0, 0, 0.7)',
      '--primary': '#6200ea',
      '--secondary': '#03dac6',
      '--warning': '#ffd600',
      '--error': '#cf6679',
      '--info': '#2196f3',
      '--success': '#4caf50',
      '--dropdown-box-shadow': 'rgba(98, 0, 234, 0.7)',
      '--group-card-hover': '#1a1a1a',
      '--seperator': '#4f4f4f',
      '--select-background-color': '#2e2e2e',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#6200ea',
      '--select-focus-box-shadow': 'rgba(98, 0, 234, 0.3)'
    },
    darkSteelBlueTheme: {
      '--background': '#121212',
      '--light-background': '#1e1e1e',
      '--surface': '#2a2a2a',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#b0b0b0',
      '--dark-text': '#ffffff',
      '--divider': '#3f3f3f',
      '--shadow': 'rgba(18, 18, 18, 0.7)',
      '--primary': '#607d8b',
      '--secondary': '#78909c',
      '--warning': '#ffb300',
      '--error': '#e53935',
      '--info': '#0288d1',
      '--success': '#43a047',
      '--dropdown-box-shadow': 'rgba(96, 125, 139, 0.7)',
      '--group-card-hover': '#1e1e1e',
      '--seperator': '#3f3f3f',
      '--select-background-color': '#2a2a2a',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#607d8b',
      '--select-focus-box-shadow': 'rgba(96, 125, 139, 0.3)'
    },
    darkGrayTheme: {
      '--background': '#1a1a1a',
      '--light-background': '#2e2e2e',
      '--surface': '#404040',
      '--primary-text': '#d0d0d0',
      '--secondary-text': '#a0a0a0',
      '--dark-text': '#ffffff',
      '--divider': '#555555',
      '--shadow': 'rgba(26, 26, 26, 0.7)',
      '--primary': '#8d8d8d',
      '--secondary': '#b0b0b0',
      '--warning': '#ffa000',
      '--error': '#e64a19',
      '--info': '#1976d2',
      '--success': '#388e3c',
      '--dropdown-box-shadow': 'rgba(141, 141, 141, 0.7)',
      '--group-card-hover': '#2e2e2e',
      '--seperator': '#555555',
      '--select-background-color': '#404040',
      '--select-text-color': '#d0d0d0',
      '--select-focus-border-color': '#8d8d8d',
      '--select-focus-box-shadow': 'rgba(141, 141, 141, 0.3)'
    },
    darkAnthraciteTheme: {
      '--background': '#181818',
      '--light-background': '#282828',
      '--surface': '#383838',
      '--primary-text': '#d3d3d3',
      '--secondary-text': '#a9a9a9',
      '--dark-text': '#ffffff',
      '--divider': '#505050',
      '--shadow': 'rgba(24, 24, 24, 0.7)',
      '--primary': '#5e35b1',
      '--secondary': '#ff7043',
      '--warning': '#ffa000',
      '--error': '#d32f2f',
      '--info': '#1976d2',
      '--success': '#388e3c',
      '--dropdown-box-shadow': 'rgba(94, 53, 177, 0.7)',
      '--group-card-hover': '#282828',
      '--seperator': '#505050',
      '--select-background-color': '#383838',
      '--select-text-color': '#d3d3d3',
      '--select-focus-border-color': '#5e35b1',
      '--select-focus-box-shadow': 'rgba(94, 53, 177, 0.3)'
    },
    graphiteGrayTheme: {
      '--background': '#121212',
      '--light-background': '#1c1c1c',
      '--surface': '#333333',
      '--primary-text': '#e0e0e0',
      '--secondary-text': '#bdbdbd',
      '--dark-text': '#ffffff',
      '--divider': '#424242',
      '--shadow': 'rgba(18, 18, 18, 0.7)',
      '--primary': '#3949ab',
      '--secondary': '#f50057',
      '--warning': '#ffab00',
      '--error': '#d32f2f',
      '--info': '#1976d2',
      '--success': '#388e3c',
      '--dropdown-box-shadow': 'rgba(57, 73, 171, 0.7)',
      '--group-card-hover': '#1c1c1c',
      '--seperator': '#424242',
      '--select-background-color': '#333333',
      '--select-text-color': '#e0e0e0',
      '--select-focus-border-color': '#3949ab',
      '--select-focus-box-shadow': 'rgba(57, 73, 171, 0.3)'
    },
    whiteTheme: {
      '--background': '#ffffff',
      '--light-background': '#f7f7f7',
      '--surface': '#e0e0e0',
      '--primary-text': '#212121',
      '--secondary-text': '#757575',
      '--dark-text': '#000000',
      '--divider': '#bdbdbd',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--primary': '#3f51b5',
      '--secondary': '#ff4081',
      '--warning': '#ffc107',
      '--error': '#f44336',
      '--info': '#2196f3',
      '--success': '#4caf50',
      '--dropdown-box-shadow': 'rgba(63, 81, 181, 0.3)',
      '--group-card-hover': '#f7f7f7',
      '--seperator': '#e0e0e0',
      '--select-background-color': '#ffffff',
      '--select-text-color': '#212121',
      '--select-focus-border-color': '#3f51b5',
      '--select-focus-box-shadow': 'rgba(63, 81, 181, 0.3)'
    },
    lightGrayTheme: {
      '--background': '#fafafa',
      '--light-background': '#ffffff',
      '--surface': '#f0f0f0',
      '--primary-text': '#424242',
      '--secondary-text': '#9e9e9e',
      '--dark-text': '#000000',
      '--divider': '#e0e0e0',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--primary': '#1976d2',
      '--secondary': '#c2185b',
      '--warning': '#ff9800',
      '--error': '#d32f2f',
      '--info': '#0288d1',
      '--success': '#388e3c',
      '--dropdown-box-shadow': 'rgba(25, 118, 210, 0.3)',
      '--group-card-hover': '#f0f0f0',
      '--seperator': '#e0e0e0',
      '--select-background-color': '#ffffff',
      '--select-text-color': '#424242',
      '--select-focus-border-color': '#1976d2',
      '--select-focus-box-shadow': 'rgba(25, 118, 210, 0.3)'
    },
    pureWhiteTheme: {
      '--background': '#ffffff',
      '--light-background': '#f8f9fa',
      '--surface': '#e9ecef',
      '--primary-text': '#343a40',
      '--secondary-text': '#6c757d',
      '--dark-text': '#000000',
      '--divider': '#dee2e6',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--primary': '#007bff',
      '--secondary': '#6c757d',
      '--warning': '#ffc107',
      '--error': '#dc3545',
      '--info': '#17a2b8',
      '--success': '#28a745',
      '--dropdown-box-shadow': 'rgba(0, 123, 255, 0.3)',
      '--group-card-hover': '#f8f9fa',
      '--seperator': '#dee2e6',
      '--select-background-color': '#ffffff',
      '--select-text-color': '#343a40',
      '--select-focus-border-color': '#007bff',
      '--select-focus-box-shadow': 'rgba(0, 123, 255, 0.3)'
    },
    iceBlueTheme: {
      '--background': '#f0f8ff',
      '--light-background': '#ffffff',
      '--surface': '#e0eaf0',
      '--primary-text': '#2c3e50',
      '--secondary-text': '#7f8c8d',
      '--dark-text': '#000000',
      '--divider': '#bdc3c7',
      '--shadow': 'rgba(44, 62, 80, 0.1)',
      '--primary': '#3498db',
      '--secondary': '#95a5a6',
      '--warning': '#f39c12',
      '--error': '#e74c3c',
      '--info': '#1abc9c',
      '--success': '#2ecc71',
      '--dropdown-box-shadow': 'rgba(52, 152, 219, 0.3)',
      '--group-card-hover': '#ecf0f1',
      '--seperator': '#bdc3c7',
      '--select-background-color': '#f0f8ff',
      '--select-text-color': '#2c3e50',
      '--select-focus-border-color': '#3498db',
      '--select-focus-box-shadow': 'rgba(52, 152, 219, 0.3)'
    },
    paleYellowTheme: {
      '--background': '#fffde7',
      '--light-background': '#fffff8',
      '--surface': '#fff9c4',
      '--primary-text': '#212121',
      '--secondary-text': '#757575',
      '--dark-text': '#000000',
      '--divider': '#e0e0e0',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--primary': '#fbc02d',
      '--secondary': '#ffa000',
      '--warning': '#ffeb3b',
      '--error': '#f44336',
      '--info': '#29b6f6',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(251, 192, 45, 0.3)',
      '--group-card-hover': '#fffff8',
      '--seperator': '#e0e0e0',
      '--select-background-color': '#fffde7',
      '--select-text-color': '#212121',
      '--select-focus-border-color': '#fbc02d',
      '--select-focus-box-shadow': 'rgba(251, 192, 45, 0.3)'
    },
    darkBlueGreenTheme: {
      '--background': '#0d1b2a',
      '--light-background': '#1b263b',
      '--surface': '#415a77',
      '--primary-text': '#e0e1dd',
      '--secondary-text': '#778da9',
      '--dark-text': '#ffffff',
      '--divider': '#4f5d75',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--primary': '#1f7a8c',
      '--secondary': '#ff9f1c',
      '--warning': '#e71d36',
      '--error': '#ff4040',
      '--info': '#4dabf7',
      '--success': '#2ec4b6',
      '--dropdown-box-shadow': 'rgba(31, 122, 140, 0.5)',
      '--group-card-hover': '#1b263b',
      '--seperator': '#4f5d75',
      '--select-background-color': '#415a77',
      '--select-text-color': '#e0e1dd',
      '--select-focus-border-color': '#1f7a8c',
      '--select-focus-box-shadow': 'rgba(31, 122, 140, 0.3)'
    },
    darkTealTheme: {
      '--background': '#0a3d62',
      '--light-background': '#1e5f74',
      '--surface': '#3c787e',
      '--primary-text': '#e0e1dd',
      '--secondary-text': '#778d8e',
      '--dark-text': '#ffffff',
      '--divider': '#4f5d75',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--primary': '#26a69a',
      '--secondary': '#ff7043',
      '--warning': '#ffa000',
      '--error': '#ef5350',
      '--info': '#42a5f5',
      '--success': '#66bb6a',
      '--dropdown-box-shadow': 'rgba(38, 166, 154, 0.5)',
      '--group-card-hover': '#1e5f74',
      '--seperator': '#4f5d75',
      '--select-background-color': '#3c787e',
      '--select-text-color': '#e0e1dd',
      '--select-focus-border-color': '#26a69a',
      '--select-focus-box-shadow': 'rgba(38, 166, 154, 0.3)'
    }
    };
  
    export function applyTheme(theme: string) {
      const themeProperties = themes[theme];
      for (const [property, value] of Object.entries(themeProperties)) {
        document.documentElement.style.setProperty(property, value);
      }
      currentTheme.set(theme);
      localStorage.setItem('selectedTheme', theme);
    }
  
    export const currentTheme: Writable<string> = writable("default");
  </script>
  
  <script lang="ts">
    import { onMount } from "svelte";
  
    onMount(() => {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        applyTheme(savedTheme);
      } else {
        applyTheme('default');
      }
    });
  </script>
  
  <style>
     .theme-switcher {
        display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .theme-button {
    padding: 5px;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    text-align: center;
  }
  
    .default {
      background-color: #526d82;
    }
  
    .darkTheme {
      background-color: #1a1a1a;
    }
  
    .lightBlueTheme {
      background-color: #e0f7fa;
    }
  
    .creamTheme {
      background-color: #f0f0e9;
    }

    .neutralTheme {
    background-color: #f5f5f5;
  }

  .blueSkyTheme {
    background-color: #e3f2fd;
  }

  .darkGrayNeonTheme {
    background-color: #2c2c2c;
  }
  .neonGreenTheme {
    background-color: #0d0d0d;
  }

  .rainbowTheme {
    background-color: #000000;
  }

  .darkTurquoiseTheme {
    background-color: #121212;
  }
  .darkBlueTheme {
    background-color: #0b0c10;
  }

  .pinkFuchsiaTheme {
    background-color: #1a1a1a;
  }

  .coralTheme {
    background-color: #ff6f61;
  }

  .acidGreenTheme {
    background-color: #ccff00;
  }

  .intensePurpleTheme {
    background-color: #2d0c57;
  }

  .brightOrangeTheme {
    background-color: #ff7043;
  }

  .darkGreenTheme {
    background-color: #0a0f0d;
  }

  .deepPurpleTheme {
    background-color: #1c0b19;
  }

  .darkBlackTheme {
    background-color: #0a0a0a;
  }

  .darkNavyTheme {
    background-color: #001f3f;
  }

  .solidBlackTheme {
    background-color: #000000;
  }

  .darkSteelBlueTheme {
    background-color: #121212;
  }

  .darkGrayTheme {
    background-color: #1a1a1a;
  }

  .darkAnthraciteTheme {
    background-color: #181818;
  }

  .graphiteGrayTheme {
    background-color: #121212;
  }

  .whiteTheme {
    background-color: #ffffff;
  }

  .lightGrayTheme {
    background-color: #fafafa;
  }

  .pureWhiteTheme {
    background-color: #ffffff;
  }

  .iceBlueTheme {
    background-color: #f0f8ff;
  }

  .paleYellowTheme {
    background-color: #fffde7;
  }

  .darkBlueGreenTheme {
    background-color: #0d1b2a;
  }

  .darkTealTheme {
    background-color: #0a3d62;
  }
  </style>
  
  <div class="theme-switcher">
    <div class="grid grid-cols-8 gap-2">
    {#each Object.keys(themes) as theme, index}
      <button class="theme-button text-red-900 {theme}" on:click={() => applyTheme(theme)}>
        {theme.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </button>
    {/each}
    </div>
  </div>
  
  