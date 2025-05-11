import { Route, Routes } from "react-router-dom";
import "./App.module.scss";
import { HomePage } from "./pages/HomePage/HomePage";
import { Game } from "./pages/Game/Game";

export function App() {
  return (
    <>
      {/* Визначення маршрутизатора з маршрутами */}
      <Routes>
        {/* Головна сторінка за шляхом "/" */}
        <Route path="/" element={<HomePage />} />
        {/* Сторінка гри за шляхом "/game" */}
        <Route path="/game" element={<Game />} />
        {/* Обробка неіснуючих маршрутів */}
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </>
  );
}

// Експортуємо App як дефолтний компонент
export default App;
