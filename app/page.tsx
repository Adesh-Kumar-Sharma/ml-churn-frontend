"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  type FormType = {
    tenure: number;
    MonthlyCharges: number;
    TotalCharges: number;
    Contract: string;
    PaymentMethod: string;
    InternetService: string;
    OnlineSecurity: string;
    TechSupport: string;
  };

  const [form, setForm] = useState<FormType>({
    tenure: 12, MonthlyCharges: 70, TotalCharges: 840,
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    InternetService: "Fiber optic",
    OnlineSecurity: "No",
    TechSupport: "No"
  });
  type ResultType = { error?: string; prediction?: string; churn_probability?: number } | null;
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL;

      if (!backendUrl) {
        throw new Error("Backend URL is not defined in environment variables.");
      }

      const { data } = await axios.post(
        backendUrl + "/predict",
        form,
        { timeout: 60000 }
      );
      setResult(data);
      setLoading(false);
    } catch (err: unknown) {
      let errorMessage = "Prediction failed";
      
      // First, check if it's an error from Axios
      if (axios.isAxiosError(err) && err.response) {
        // If the backend sent a specific error message, use it
        errorMessage = err.response.data.error || "An error occurred with the API.";
      } else if (err instanceof Error) {
        // For other types of errors (e.g., network issues), use their message
        errorMessage = err.message;
      }
      
      setResult({ error: errorMessage });
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Churn Prediction
        </h1>
        <h2 className="text-1xl text-center text-gray-900 dark:text-white">
          Try my Churn Prediction App! No technical knowledge needed—just enter sample customer data and see the model output instantly.
        </h2>
        <h3 className="text-1sl text-center text-gray-900 dark:text-white">
          (May take up to a minute for first request)
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {Object.keys(form).map(key => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {key}
              </label>
              <input
                name={key}
                value={form[key as keyof FormType]}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          <button disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Predicting..." : "Check Churn Status"}
          </button>
        </form>
        {result && (
          <div className="mt-6 p-4 rounded-md text-center bg-gray-100 dark:bg-gray-700">
            {result.error
              ? <span className="text-red-500 font-semibold">{result.error}</span>
              : <>
                  <div className="text-lg text-gray-900 dark:text-white">Prediction: <b className="font-bold">{result.prediction}</b></div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Churn Probability: <b>
                      {typeof result.churn_probability === "number"
                        ? `${(result.churn_probability * 100).toFixed(2)}%`
                        : "N/A"}
                    </b>
                  </div>
                </>
            }
          </div>
        )}
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Built with ❤️ by <a href="https://www.linkedin.com/in/adesh-kumar-sharma-jbp/" className="text-blue-500 hover:underline">Adesh Kumar Sharma</a>
        </div>
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <a href="https://github.com/Adesh-Kumar-Sharma/ml-churn-prediction/" className="text-blue-500 hover:underline">GitHub Repo (ML)</a>
        </div>
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <a href="https://github.com/Adesh-Kumar-Sharma/ml-churn-frontend/" className="text-blue-500 hover:underline">GitHub Repo (Frontend)</a>
        </div>
      </div>
    </main>
  );
}
