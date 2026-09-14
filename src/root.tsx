import { component$ } from '@builder.io/qwik';
import Home from './routes/index';
import './global.css';
import './modal.css';

export default component$(() => <>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#080b18" />
    <title>Zunex | Universal wallet provider</title>
  </head>
  <body><Home /></body>
</>);
