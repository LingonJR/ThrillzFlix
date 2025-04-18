import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "MovieFlix - Free Movie Streaming";

createRoot(document.getElementById("root")!).render(<App />);
