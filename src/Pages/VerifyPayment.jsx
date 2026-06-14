"use client"
import { getTokenUserId } from "../lib/auth";

import React, { useEffect, useState } from "react";
import { verifyPayment as verifyPaymentApi } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function VerifyPayment() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // "success" | "failed"
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        const ref = localStorage.getItem("no");
        const courseId = localStorage.getItem("course");

        if (!token || !ref || !courseId) {
          setStatus("failed");
          setLoading(false);
          return;
        }

        const userId = getTokenUserId();

        const payload = {
          courseId,
          userId,
          ref,
        };

        const res = await verifyPaymentApi(payload);

        if (res.success) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error(error);
        setStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl font-semibold">
        Verifying Payment...
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      {status === "success" ? (
        <div>
          <h1 className="text-green-600 text-3xl font-bold">Payment Successful 🎉</h1>
          <p className="text-gray-600 mt-3">Your payment has been verified.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-red-600 text-3xl font-bold">Payment Failed ❌</h1>
          <p className="text-gray-600 mt-3">We could not verify your payment.</p>
        </div>
      )}

      {/* Return Button */}
      <button
        onClick={() => navigate("/learning-management")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Return to Learning Hub
      </button>
    </div>
  );
}
 
