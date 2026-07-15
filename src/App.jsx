import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/GlobalCustomStyle/GlobalCustomStyle.css";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import Footer from "./Components/Footer/Footer";

// Without this, React Router keeps the previous page's scroll offset, so
// every navigation landed mid-page. Hash links still scroll to their target.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <NavigationBar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default App;
