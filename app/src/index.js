import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.scss';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        {!localStorage.getItem('chakra-ui-color-mode') &&
            localStorage.setItem('chakra-ui-color-mode', 'dark')}
        <ChakraProvider>
            <ColorModeScript storageKey="colormode" type="cookie" />
            <App />
        </ChakraProvider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
