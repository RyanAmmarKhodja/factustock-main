import "./App.css";
import "./styles/globals.css";

import AuthProvider from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import StartupGate from "./api/StartupGate";

function App() {
  return (
    <div>
      <AuthProvider>
        <BrowserRouter>
          <StartupGate>
            <AppRouter />
          </StartupGate>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
