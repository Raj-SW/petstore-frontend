import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/GlobalCustomStyle/GlobalCustomStyle.css";
import { Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <>
      <NavigationBar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default App;
