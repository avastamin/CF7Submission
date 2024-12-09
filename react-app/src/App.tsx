import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RectangleGroupIcon } from "@heroicons/react/20/solid";
// Import views
import SubmissionsList from "./SubmissionsList";
import SubmissionDetails from "./SubmissionDetails";
import SubmissionByForm from "./SubmissionByForm";

const callsToAction = [
  { name: "Submissions", href: "/", icon: RectangleGroupIcon },
  { name: "Forms", href: "/", icon: RectangleGroupIcon },
  { name: "Settings", href: "/", icon: RectangleGroupIcon },
];

const App = () => {
  return (
    <Router>
      <div className="admin-app -ml-5">
        <div className="bg-gray-50 ml-4">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 divide-y divide-gray-900/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-x sm:border-gray-900/5">
              {callsToAction.map((item) => (
                <Link to="/">
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-x-2.5 p-3 px-6 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100 sm:justify-center sm:px-0"
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-5 flex-none text-gray-400"
                    />
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>

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
