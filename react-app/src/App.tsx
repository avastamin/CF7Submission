import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import views
import SubmissionsList from "./SubmissionsList";
import SubmissionDetails from "./SubmissionDetails";
import SubmissionByForm from "./SubmissionByForm";

const App = () => {
  return (
    <Router>
      <div className="admin-app">
        <nav>
          <ul>
            <li>
              <Link to="/">Submissions</Link>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<SubmissionsList />} />
            <Route
              path="/form/:form_id/submission"
              element={<SubmissionByForm />}
            />
            <Route
              path="/form/:form_id/submission/:id"
              element={<SubmissionDetails />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
