import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Submission } from "./types";
import { truncateString } from "./helpers";

const SubmissionDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      const response = await fetch(
        `${window.cf7ReactPlugin.apiUrl}/wp-json/cf7/v1/submissions/${id}`
      );
      const data = await response.json();
      setSubmission(data);
      setLoading(false);
    };

    fetchSubmission();
  }, [id]);

  // Get unique keys from submission_data for table headers
  const submissionDataKeys = submission
    ? Object.keys(submission.submission_data || {})
    : [];

  if (loading) return <p>Loading submission details...</p>;
  if (!submission) return <p>Submission not found.</p>;

  console.log("submission", submission);
  return (
    <div>
      <h1>Submission Details</h1>
      <p>
        <strong>Form Name:</strong> {submission.form_name}
      </p>
      <p>
        <strong>Submitted At:</strong> {submission.submitted_at}
      </p>
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
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Form Name
                  </th>
                  {submissionDataKeys.map((key) => (
                    <th
                      key={key}
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      {key}
                    </th>
                  ))}
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
                <tr
                  key={submission.id}
                  className="even:bg-gray-50 cursor-pointer"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                    {submission.id}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                    {submission.form_id}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                    {submission?.form_name}
                  </td>
                  {submissionDataKeys.map((key) => (
                    <td
                      key={`${submission.id}-${key}`}
                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {typeof submission.submission_data[key] === "string"
                        ? truncateString(submission.submission_data[key], 60)
                        : JSON.stringify(submission.submission_data[key])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {submission.submitted_at}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Link to="/">Back to Submissions</Link>
    </div>
  );
};

export default SubmissionDetails;
