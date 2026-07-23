import { BrowserRouter, Routes, Route } from "react-router-dom";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;