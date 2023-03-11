import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './app/App';
import * as serviceWorker from './serviceWorker';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

ReactDOM.render(
    <React.StrictMode>
        {!localStorage.getItem('chakra-ui-color-mode') &&
            localStorage.setItem('chakra-ui-color-mode', 'dark')}
        <ChakraProvider>
            <ColorModeScript />
            <App />
        </ChakraProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
