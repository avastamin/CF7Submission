declare global {
  interface Window {
    cf7ReactPlugin: {
      apiUrl: string;
    };
  }
}

import { useState, useEffect } from "react";

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
      <table>
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
    </div>
  );
};

export default CF7Submissions;
