declare global {
  interface Window {
    cf7ReactPlugin: {
      apiUrl: string;
    };
  }
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface FormName {
  name: string;
  id: string;
}

const SubmissionFormList = () => {
  const [formNames, setFormNames] = useState<FormName[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${window.cf7ReactPlugin.apiUrl}/wp-json/cf7/v1/form-names`
        );
        const data = await response.json();
        console.log("form names", data);
        setFormNames(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching form names:", error);
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
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <ul role="list" className="divide-y divide-gray-100">
            {formNames.map((formName, index) => (
              <li
                key={index}
                className="relative py-5 hover:bg-gray-50 cursor-pointer"
              >
                <Link to={`/form/${formName.id}/submission`}>
                  {formName.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubmissionFormList;
