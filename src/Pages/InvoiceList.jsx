import React, { useEffect, useState } from "react";
import { loadPurpose, updatePayAfterInvoice } from "../lib/api";
import { jwtDecode } from "jwt-decode";


const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [update,setUpdate]= useState(false)

  const token = localStorage.getItem("token");
  useEffect(() => {
    const loadCompetitions = async () => {
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
  }, [update]);
  const handleSubmit= async(item)=>{
    const id = localStorage.getItem("id")
    
    try{

      const response = await updatePayAfterInvoice(item, id)
      console.log(response)
      setUpdate(!update)




    }catch(error){
      console.log(error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 w-[100%]">
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
                
                <h1 className="font-semibold">{`Grade ${item.grade}`}</h1>
                
                <p>{(item.choice.assessment&&item.choice.course)&&"assessment and courses included"}</p>
                {!(item.choice.assessment&&item.choice.course)&&<p>{item.choice.assessment? "assessment only":""}</p>}
                {!(item.choice.assessment&&item.choice.course)&&<p>{item.choice.course? "courses only":""}</p>}
                {(!item.choice.assessment&&!item.choice.course)&&<p>No AddOns</p>}
                <button onClick={()=>{handleSubmit(item)}} className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center justify-center mx-auto">
                  {`Pay ₵${item.Cost}`}
                  <span className="ml-2">
                    {/* <PaystackHookExample /> */}
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center mt-10">fetching invoices....</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;