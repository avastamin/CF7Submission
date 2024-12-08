declare global {
  interface Window {
    cf7ReactPlugin: {
      apiUrl: string;
    };
  }
}

import { useState, useEffect } from "react";
import { truncateString } from "./helpers";

interface Submission {
  id: number;
  form_id: number;
  submission_data: Record<string, string | string[]>;
  submitted_at: string;
}

const CF7Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${window.cf7ReactPlugin.apiUrl}/wp-json/cf7/v1/submissions`
        );
        const data = await response.json();
        console.log("submissions", data);
        setSubmissions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div>
      <h1>CF7 Submissions</h1>

      {/*       <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Form ID</th>
            <th>Submission Data</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td>{submission.id}</td>
              <td>{submission.form_id}</td>
              <td>
                <ul>
                  {Object.entries(submission.submission_data).map(
                    ([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong>{" "}
                        {Array.isArray(value) ? value.join(", ") : value}
                      </li>
                    )
                  )}
                </ul>
              </td>
              <td>{submission.submitted_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
 */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Form ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Submission Data
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Submitted At
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="even:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                      {submission.id}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                      {submission.form_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {truncateString(
                        JSON.stringify(submission.submission_data),
                        100
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {submission.submitted_at}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View<span className="sr-only">, {submission.id}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CF7Submissions;
