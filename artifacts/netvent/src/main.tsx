import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Configure auth token getter — reads from localStorage
setAuthTokenGetter(() => localStorage.getItem("nvp_token"));

createRoot(document.getElementById("root")!).render(<App />);
