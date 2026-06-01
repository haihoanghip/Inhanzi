import { useState } from "react";
import Header from "./pages/Header";
import Homepage from "./pages/Homepage";

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
    <>
      <Header activeModal={activeModal} openModal={openModal} closeModal={closeModal} />
      <Homepage onOpenModal={openModal} />
    </>
  );
}

export default App;
