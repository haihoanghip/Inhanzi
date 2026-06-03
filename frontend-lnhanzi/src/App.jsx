import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./pages/Header";
import Homepage from "./pages/Homepage";
import GoogleCallback from "./pages/GoogleCallback";

function App() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => setActiveModal(type);
  const closeModal = (type) => {
    if (typeof type === 'string') {
      setActiveModal(type);
    } else {
      setActiveModal(null);
    }
  };

  return (
    <Routes>
      <Route path="/google-callback" element={<GoogleCallback />} />
      <Route
        path="*"
        element={
          <>
            <Header activeModal={activeModal} openModal={openModal} closeModal={closeModal} />
            <Homepage onOpenModal={openModal} />
          </>
        }
      />
    </Routes>
  );
}

export default App;
