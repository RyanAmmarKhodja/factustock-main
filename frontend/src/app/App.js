import "./App.css";
import "../shared/styles/globals.css";

import AuthProvider from "../shared/context/AuthContext";
import AppRouter from "../shared/router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import StartupGate from "../shared/api/StartupGate";

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
