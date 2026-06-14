"use client"

import Sidebar from "../Components/common/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCompetitions, getAllInterests, getRegisteredPrograms } from "../lib/api";
import { jwtDecode } from "jwt-decode";

const ProgramsPageWithSidebar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allCompetitions, setCompetitions] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [available, setAvailable] = useState([]);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [interestOptions, setInterestOptions] = useState([]);
  const [quickStartFilter, setQuickStartFilter] = useState("");
  const [quickEndFilter, setQuickEndFilter] = useState("");
  const [filterMaterialCostZero, setFilterMaterialCostZero] = useState(false);
  const [filterAssessmentCostZero, setFilterAssessmentCostZero] = useState(false);
  const [filterCompetitionCostZero, setFilterCompetitionCostZero] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await getAllCompetitions();
        const data = response.AllCompetitions;
        setCompetitions(data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await getAllInterests();
        const payload = response.interests || [];
        let list = Array.isArray(payload)
          ? payload
          : payload.data || payload.interests || [];
        if (!Array.isArray(list)) list = [];
        const labels = Array.from(
          new Set(
            list
              .map((item) => {
                if (typeof item === "string") return item;
                return (
                  item?.name || item?.interest || item?.type || item?.title || ""
                );
              })
              .filter(Boolean)
          )
        );
        setInterestOptions(labels);
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    };

    fetchInterests();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem("user") || "{}");
        const firstName = profile.first_name || profile.firstName || "";
        const lastName = profile.last_name || profile.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const year = new Date().getFullYear();
        const response = await getRegisteredPrograms(fullName);
        const data = response.programs;

        // Match and replace from allCompetitions
        const updatedRegistered = data.map((regItem) => {
          const match = allCompetitions.find((comp) => comp.name === regItem.program);
          return match ? match : regItem;
        });

        setRegistered(updatedRegistered);

        // Create list of unregistered competitions
        const unregistered = allCompetitions.filter(
          (item) => !updatedRegistered.some((reg) => reg.name === item.name)
        );

        setAvailable(unregistered);
      } catch (error) {
        console.error("Error fetching registered programs:", error);
      }
    };

    fetchPrograms();
  }, [allCompetitions]);

  const handleCardClick = (id, subItem) => {
    localStorage.setItem("id", id);
    localStorage.setItem("state", JSON.stringify(subItem));
    navigate(`/subitem/${subItem.name}`, { state: subItem });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helpers for date-based quick filters
  const startOfDay = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return startOfDay(a).getTime() === startOfDay(b).getTime();
  };

  const addDays = (date, days) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const addMonths = (date, months) => {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + months);
    return copy;
  };

  // Week helpers
  const startOfWeek = (date) => {
    const copy = startOfDay(new Date(date));
    // Set Monday as start of week (0=Sun,1=Mon,...)
    const day = copy.getDay();
    const diffToMonday = (day + 6) % 7; // 0->6, 1->0, 2->1, ...
    copy.setDate(copy.getDate() - diffToMonday);
    return copy;
  };

  const endOfWeek = (date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  };

  const isInThisMonth = (d, ref) =>
    d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();

  const isInThisWeek = (d, ref) => {
    const start = startOfWeek(ref);
    const end = endOfWeek(ref);
    const day = startOfDay(d);
    return day >= start && day <= end;
  };

  const passesStartQuickFilter = (program) => {
    if (!quickStartFilter) return true;
    const start = program.startDate ? new Date(program.startDate) : null;
    if (!start) return false;
    const today = startOfDay(new Date());
    if (quickStartFilter === "today") return isSameDay(start, today);
    if (quickStartFilter === "this_week") return isInThisWeek(start, today);
    if (quickStartFilter === "this_month") return isInThisMonth(start, today);
    return true;
  };

  const passesEndQuickFilter = (program) => {
    if (!quickEndFilter) return true;
    const endRaw = program.endDate || program.EndDate;
    const end = endRaw ? new Date(endRaw) : null;
    if (!end) return false;
    const today = startOfDay(new Date());
    if (quickEndFilter === "today") return isSameDay(end, today);
    if (quickEndFilter === "this_week") return isInThisWeek(end, today);
    if (quickEndFilter === "this_month") return isInThisMonth(end, today);
    return true;
  };

  const isZeroCost = (value) => {
    if (value === null || value === undefined) return false;
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    if (Number.isNaN(num)) return false;
    return num === 0;
  };

  // Filter both registered and available programs by search term
  const searchLower = searchTerm.toLowerCase();

  const filteredRegistered = registered.filter((program) => {
    const nameLower = (program.name || program.program || "").toLowerCase();
    if (!nameLower.includes(searchLower)) return false;

    if (selectedInterest) {
      const programType =
        (program.item && program.item.type) ||
        program.type ||
        program.Type ||
        "";
      if (String(programType).toLowerCase() !== selectedInterest.toLowerCase()) {
        return false;
      }
    }

    if (startDateFilter) {
      const programStart = program.startDate ? new Date(program.startDate) : null;
      const filterStart = new Date(startDateFilter);
      if (!programStart || programStart < filterStart) return false;
    }

    if (endDateFilter) {
      const endRaw = program.endDate || program.EndDate;
      const programEnd = endRaw ? new Date(endRaw) : null;
      const filterEnd = new Date(endDateFilter);
      if (!programEnd || programEnd > filterEnd) return false;
    }

    if (!passesStartQuickFilter(program)) return false;
    if (!passesEndQuickFilter(program)) return false;

    if (filterMaterialCostZero) {
      const material = program.materialCost ?? program.MaterialCost;
      if (!isZeroCost(material)) return false;
    }

    if (filterAssessmentCostZero) {
      const assessment = program.assessmentCost ?? program.AssessmentCost;
      if (!isZeroCost(assessment)) return false;
    }

    if (filterCompetitionCostZero) {
      const competition = program.competitionCost ?? program.CompetitionCost;
      if (!isZeroCost(competition)) return false;
    }

    return true;
  });

  const filteredAvailable = available.filter((program) => {
    const nameLower = (program.name || "").toLowerCase();
    if (!nameLower.includes(searchLower)) return false;

    if (selectedInterest) {
      const programType =
        (program.item && program.item.type) ||
        program.type ||
        program.Type ||
        "";
      if (String(programType).toLowerCase() !== selectedInterest.toLowerCase()) {
        return false;
      }
    }

    if (startDateFilter) {
      const programStart = program.startDate ? new Date(program.startDate) : null;
      const filterStart = new Date(startDateFilter);
      if (!programStart || programStart < filterStart) return false;
    }

    if (endDateFilter) {
      const endRaw = program.endDate || program.EndDate;
      const programEnd = endRaw ? new Date(endRaw) : null;
      const filterEnd = new Date(endDateFilter);
      if (!programEnd || programEnd > filterEnd) return false;
    }

    if (!passesStartQuickFilter(program)) return false;
    if (!passesEndQuickFilter(program)) return false;

    if (filterMaterialCostZero) {
      const material = program.materialCost ?? program.MaterialCost;
      if (!isZeroCost(material)) return false;
    }

    if (filterAssessmentCostZero) {
      const assessment = program.assessmentCost ?? program.AssessmentCost;
      if (!isZeroCost(assessment)) return false;
    }

    if (filterCompetitionCostZero) {
      const competition = program.competitionCost ?? program.CompetitionCost;
      if (!isZeroCost(competition)) return false;
    }

    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#003366] mb-2">Gifted Education Platform</h1>
          <h2 className="text-2xl font-semibold text-[#336699] mb-1">Programs & Competitions</h2>
          <p className="text-gray-600 text-base max-w-xl">
            Select a competition type to explore available programs and track your progress
          </p>
        </div>

        <div className="flex items-center mb-6 flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg mr-4"
          />
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
            aria-label="Filter by start date"
          />
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
            aria-label="Filter by end date"
          />
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {interestOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Start:</span>
            <div className="flex rounded-full bg-gray-100 p-1">
              {[
                { key: "", label: "All" },
                { key: "today", label: "Today" },
                { key: "this_week", label: "This week" },
                { key: "this_month", label: "This month" },
              ].map((opt) => (
                <button
                  key={opt.key || "all"}
                  onClick={() => setQuickStartFilter(opt.key)}
                  className={`${quickStartFilter === opt.key ? "bg-[#003366] text-white" : "text-[#003366]"} px-3 py-1 text-xs rounded-full transition`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">End:</span>
            <div className="flex rounded-full bg-gray-100 p-1">
              {[
                { key: "", label: "All" },
                { key: "today", label: "Today" },
                { key: "this_week", label: "This week" },
                { key: "this_month", label: "This month" },
              ].map((opt) => (
                <button
                  key={opt.key || "all"}
                  onClick={() => setQuickEndFilter(opt.key)}
                  className={`${quickEndFilter === opt.key ? "bg-[#003366] text-white" : "text-[#003366]"} px-3 py-1 text-xs rounded-full transition`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Costs:</span>
            <div className="flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setFilterMaterialCostZero((v) => !v)}
                className={`${filterMaterialCostZero ? "bg-green-600 text-white" : "text-green-700"} px-3 py-1 text-xs rounded-full transition`}
                aria-pressed={filterMaterialCostZero}
              >
                Material = 0
              </button>
              <button
                onClick={() => setFilterAssessmentCostZero((v) => !v)}
                className={`${filterAssessmentCostZero ? "bg-blue-600 text-white" : "text-blue-700"} px-3 py-1 text-xs rounded-full transition`}
                aria-pressed={filterAssessmentCostZero}
              >
                Assessment = 0
              </button>
              <button
                onClick={() => setFilterCompetitionCostZero((v) => !v)}
                className={`${filterCompetitionCostZero ? "bg-purple-600 text-white" : "text-purple-700"} px-3 py-1 text-xs rounded-full transition`}
                aria-pressed={filterCompetitionCostZero}
              >
                Competition = 0
              </button>
            </div>
          </div>
          <button className="bg-[#003366] text-white px-4 py-2 rounded-lg">Search</button>
        </div>

        <h1 className="text-2xl font-bold text-[#003366] mb-6">Your Registered Programs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filteredRegistered.map((program, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md border border-[#003366] hover:shadow-lg cursor-pointer"
              onClick={() => handleCardClick(program.id, program)}
            >
              <h3 className="text-xl font-semibold text-[#003366] mb-2">
                {`${program.name || program.program}-${program.year}`}
              </h3>
              <p className="text-sm text-gray-600">Start: {formatDate(program.startDate)}</p>
              <p className="text-sm text-gray-600">End: {formatDate(program.endDate || program.EndDate)}</p>
              <p className="text-sm text-green-600 font-medium mt-2">Registered</p>
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-[#003366] mb-6">Available Programs</h1>
        {filteredAvailable.length === 0 ? (
          <p className="text-gray-600">You have registered for all available programs.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailable.map((program, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleCardClick(program.id, program)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{`${program.name}-${program.year}`}</h3>
                <p className="text-sm text-gray-600">Start: {formatDate(program.startDate)}</p>
                <p className="text-sm text-gray-600">End: {formatDate(program.endDate)}</p>
                <button className="mt-3 bg-[#336699] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#003366]">
                  Register Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsPageWithSidebar;
