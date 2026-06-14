import React, { useEffect, useState } from "react";
import { loadPurpose } from "../lib/api";
// import Sidebar from "../Components/Sidebar";
// import { SidebarItem } from "../Components/Sidebar";
// import { Home, StickyNote, Layers, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { PaystackHookExample } from "@/Components/PayStackButton";

const Payment = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const loadCompetitions = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await loadPurpose(token);
        if (response.success) {
          setInvoices(response.invoices);
          localStorage.setItem("Invoice", JSON.stringify(response.invoices));
        }
      } catch (error) {
        console.error("Error loading invoices:", error);
      }
    };

    loadCompetitions();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Section */}
      {/* <Sidebar>
        <SidebarItem icon={<Home size={20} />} text="Dashboard" alert link="/" />
        <SidebarItem icon={<StickyNote size={20} />} text="Community" alert link="/" />
        <Link to="/make-payment">
          <SidebarItem icon={<Calendar size={20} />} text="Invoices" link="/make-payment" />
        </Link>
        <SidebarItem icon={<Layers size={20} />} text="Add Ons" link="/" />
      </Sidebar> */}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Payment Invoices
        </h1>

        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((item) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{item.name}</p>
                <button className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center justify-center mx-auto">
                  {`Pay $${item.Cost}`}
                  <span className="ml-2">
                    <PaystackHookExample />
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center mt-10">No invoices found.</p>
        )}
      </div>
    </div>
  );
};

export default Payment;