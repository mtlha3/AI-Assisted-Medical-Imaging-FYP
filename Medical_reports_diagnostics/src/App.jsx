import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Nav from "./components/Nav";
import Home from "./Pages/Home";
import BlogForm from "./Pages/BlogForm";
import Dashboard from "./Pages/Dashboard";
import AnalysisPage from "./Pages/AnalysisPage";
import About from "./Pages/About";

function App() {
  return (<>
    <Nav/>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/blogs" element={<BlogForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  </>
  );
}

export default App;
