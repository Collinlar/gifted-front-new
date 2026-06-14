import React, { useEffect, useState } from "react";
import { getAllCompetitions } from "../lib/api";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllCompetitions();
        const competitions = response.AllCompetitions;

        // Main events
        const mainEvents = competitions.map(event => ({
          start: new Date(event.startDate),
          end: new Date(event.EndDate),
          title: event.name,
          description: event.description,
          subType: event.subType,
          type: "main",
        }));

        // SubType events as their own calendar entries
        const subTypeEvents = competitions.flatMap(event =>
          event.subTypes?.map(sub => ({
            start: new Date(sub.startDate),
            end: new Date(sub.EndDate),
            title: `${event.name} - ${sub.name}`,
            description: `Sub-type of ${event.name}`,
            type: "sub",
          })) || []
        );

        setEvents([...mainEvents, ...subTypeEvents]);
        console.log(subTypeEvents)
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="p-4 w-full h-full bg-gray-50 min-h-screen flex justify-center items-center overflow-auto">
      <div className="max-w-6xl w-full bg-white p-8 rounded-lg shadow-md">

        {/* Calendar Header */}
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">📆 All Events Calendar</h2>

        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600, marginBottom: "30px" }}
          selectable
          onSelectEvent={handleSelectEvent}
        />

        {/* Event Details (Canvas) */}
        {selectedEvent && (
          <div className="w-full bg-white rounded-lg shadow p-6 mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📌 Event Details</h3>
            <div className="border-b-2 border-gray-300 pb-4 mb-4">
              <p><strong className="text-gray-700">Title:</strong> {selectedEvent.title}</p>
              <p><strong className="text-gray-700">Description:</strong> {selectedEvent.description}</p>
              <p><strong className="text-gray-700">Start:</strong> {selectedEvent.start.toLocaleString()}</p>
              <p><strong className="text-gray-700">End:</strong> {selectedEvent.end.toLocaleString()}</p>
            </div>

            {/* SubTypes */}
            {selectedEvent.subType?.length > 0 && (
              <div>
                <strong className="text-gray-700">Sub Types:</strong>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-2">
                  {selectedEvent.subType.map((typeObj, idx) => (
                    <li key={idx}>
                      <p><strong className="font-semibold">{typeObj.type}</strong></p>
                      <p className="ml-4 text-gray-600">
                        🕒 {new Date(typeObj.startDate).toLocaleString()} - {new Date(typeObj.endDate).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close Button */}
            <button 
              onClick={() => setSelectedEvent(null)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
