import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Results from "./pages/Results";
import VehicleDetails from "./pages/VehicleDetails";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <div className="appShell">
      <Navbar />
      <main className="appMain">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
