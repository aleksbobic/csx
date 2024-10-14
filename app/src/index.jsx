import "./index.scss";

import * as React from "react";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

import App from "./app/App";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {!localStorage.getItem("chakra-ui-color-mode") &&
      localStorage.setItem("chakra-ui-color-mode", "dark")}
    <ChakraProvider>
      <ColorModeScript storageKey="colormode" type="cookie" />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
