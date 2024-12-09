import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import views
import SubmissionsList from "./SubmissionsList";
import SubmissionDetails from "./SubmissionDetails";
import SubmissionByForm from "./SubmissionByForm";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/all-submissions" replace />} />
        <Route path="/all-submissions" element={<SubmissionsList />} />
        <Route
          path="/form/:form_id/submission"
          element={<SubmissionByForm />}
        />
        <Route
          path="/form/:form_id/submission/:id"
          element={<SubmissionDetails />}
        />
      </Routes>
    </Router>
  );
};

export default App;
