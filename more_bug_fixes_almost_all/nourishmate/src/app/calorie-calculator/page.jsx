"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CalorieCalculator() {
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [specificGoal, setSpecificGoal] = useState("");
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [weightEntries, setWeightEntries] = useState([]);
  const [inputWeight, setInputWeight] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [user, setUser] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await fetchWeightData();
        await fetchStreakData();
      } else {
        setUser(null);
      }
      setIsAuthChecked(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setIsAuthChecked(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!gender) newErrors.gender = "Please select your gender.";
    if (!activityLevel)
      newErrors.activityLevel = "Please select your activity level.";
    if (!goal) newErrors.goal = "Please select your goal.";
    if ((goal === "weight_loss" || goal === "weight_gain") && !specificGoal)
      newErrors.specificGoal = "Please select a specific goal.";
    if (!weight || weight <= 0)
      newErrors.weight = "Please enter a valid weight.";
    if (!height || height <= 0)
      newErrors.height = "Please enter a valid height.";
    if (!age || age <= 0) newErrors.age = "Please enter a valid age.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadCSV = () => {
    if (weightEntries.length === 0) {
      alert("No weight data available for download.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Date,Weight (kg)\n";

    weightEntries.forEach((entry) => {
      const formattedDate = new Date(entry.date)
        .toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-"); // Ensures Excel reads it correctly
      csvContent += `${formattedDate},${entry.weight}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weight_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(1); // Skip header row
      const parsedData = [];

      rows.forEach((row) => {
        if (row.trim() === "") return;

        const [dateString, weight] = row.split(",");
        const formattedDate = new Date(
          dateString.split(/[-/]/).reverse().join("-")
        ).toISOString();

        parsedData.push({ date: formattedDate, weight: parseFloat(weight) });
      });

      console.log("Parsed Data:", parsedData);
      setWeightEntries(parsedData); // ✅ Update UI instantly

      // ✅ Send the parsed CSV data to the backend for saving
      try {
        const res = await fetch("/api/upload-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: parsedData }),
        });

        if (!res.ok) throw new Error("Failed to save CSV data");

        console.log("CSV data successfully saved to the database!");
      } catch (error) {
        console.error("Error saving CSV:", error);
      }
    };

    reader.readAsText(file);
  };

  const fetchWeightData = async () => {
    try {
      console.log("🔄 Fetching weight history...");
      const weightResponse = await fetch("/api/get-weight-history", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (weightResponse.ok) {
        let weightData = await weightResponse.json();
        console.log("✅ Raw weight data received:", weightData);

        if (Array.isArray(weightData) && weightData.length > 0) {
          weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
          console.log("✅ Sorted weight data:", weightData);
          setWeightEntries(weightData);
        } else {
          console.warn("⚠️ No weight data found for user.");
          setWeightEntries([]);
        }
      } else {
        console.error("❌ Failed to fetch weight history.");
      }
    } catch (error) {
      console.error("❌ Error fetching weight data:", error);
    }
  };

  const fetchStreakData = async () => {
    try {
      const response = await fetch("/api/streak/get-streak", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
      } else {
        console.error("Failed to fetch streak data.");
      }
    } catch (error) {
      console.error("Error fetching streak data:", error);
    }
  };

  // Loading state - only show when checking auth and not finished yet
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calorie Calculator
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Loading your calorie data...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Authentication screen - only show when auth check is complete AND user is not authenticated
  if (!user && isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calorie Calculator
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Calculate your daily calorie needs and track your weight journey
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-16 text-center px-4">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to calculate your calorie needs and track your
              weight progress.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Sign In
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account?
              <button
                onClick={() => router.push("/register")}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddWeightEntry = async () => {
    if (!inputWeight || !inputDate) {
      alert("Please enter a weight and date.");
      return;
    }

    if (!user) {
      alert("You must be logged in to track weight.");
      return;
    }

    try {
      const response = await fetch("/api/save-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: inputDate,
          weight: parseFloat(inputWeight),
        }),
        credentials: "include",
      });

      if (response.ok) {
        setWeightEntries((prevEntries) => {
          const updatedEntries = [
            ...prevEntries,
            { date: inputDate, weight: parseFloat(inputWeight) },
          ];
          updatedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
          return updatedEntries;
        });

        // Update streak
        const streakResponse = await fetch("/api/streak/update-streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: inputDate }),
          credentials: "include",
        });

        if (streakResponse.ok) {
          const streakData = await streakResponse.json();
          setStreak(streakData.streak);

          // Show notifications for new achievements
          if (
            streakData.newAchievements &&
            streakData.newAchievements.length > 0
          ) {
            streakData.newAchievements.forEach((achievement) => {
              toast.success(
                <div className="flex items-center gap-2">
                  <span className="text-xl">{achievement.icon || "🏆"}</span>
                  <div>
                    <p className="font-bold">New Achievement Unlocked!</p>
                    <p>
                      {achievement.name}: {achievement.description}
                    </p>
                  </div>
                </div>,
                {
                  duration: 5000,
                  style: {
                    background: "linear-gradient(to right, #fef6e4, #fffbeb)",
                    padding: "16px",
                    color: "#1a1a1a",
                    border: "1px solid #fde68a",
                  },
                }
              );
            });
          }
        } else {
          console.error("Failed to update streak.");
        }

        setInputWeight("");
        setInputDate("");
      } else {
        alert("Failed to save weight entry. Try again.");
      }
    } catch (error) {
      console.error("Error saving weight entry:", error);
    }
  };

  const handleDeleteWeightEntry = async (entryId) => {
    if (!entryId) {
      console.error("❌ Entry ID is missing when calling delete function.");
      alert("Error: Entry ID is missing.");
      return;
    }

    if (!user) {
      alert("You must be logged in to delete weight entries.");
      return;
    }

    try {
      console.log("🗑 Deleting weight entry with ID:", entryId);

      const response = await fetch("/api/remove-weight-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entryId }), // ✅ Ensure entryId is sent correctly
        credentials: "include",
      });

      const result = await response.json(); // Read the response

      if (response.ok) {
        console.log("✅ Weight entry deleted successfully:", result);

        // ✅ Remove the deleted entry from state
        setWeightEntries((prevEntries) =>
          prevEntries.filter((entry) => entry._id !== entryId)
        );
      } else {
        console.error("❌ Failed to delete weight entry:", result);
        alert(result.error || "Failed to delete weight entry. Try again.");
      }
    } catch (error) {
      console.error("❌ Error deleting weight entry:", error);
    }
  };

  const handleDeleteAllWeightEntries = async () => {
    if (!confirm("Are you sure you want to delete all weight entries?")) return;

    try {
      const response = await fetch("/api/delete-all-weight-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        alert("All weight entries deleted successfully!");
        setWeightEntries([]); // Clear the local state
      } else {
        const errorData = await response.json();
        alert(`Failed to delete weight entries: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting all weight entries:", error);
      alert("An error occurred while deleting weight entries.");
    }
  };

  const handleCalculate = async () => {
    setResults(null); // Clear previous results
    if (!validateInputs()) return;

    try {
      const response = await fetch("/api/calorie-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          weight,
          height,
          age,
          activityLevel,
          goal,
          specificGoal, // Include specific goal
        }),
      });
      const data = await response.json();
      setResults(data); // Update with new results
    } catch (error) {
      console.error("Error calculating calories:", error);
    }
  };

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
    setSpecificGoal(""); // ✅ Reset specific goal when goal changes
    setResults(null);
  };

  const handleSave = async () => {
    if (!results) {
      setSuccessMessage("No results to save. Please calculate first.");
      return;
    }

    try {
      const response = await fetch("/api/save-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmr: results.bmr,
          tdee: results.tdee,
          targetCalories: results.targetCalories,
          activityLevel, // ✅ Send activity level
          goal, // ✅ Send goal
        }),
      });

      if (response.ok) {
        setSuccessMessage(
          "Caloric data, activity level, and goal saved to your profile successfully."
        );
      } else {
        setSuccessMessage("Failed to save data to your profile.");
      }
    } catch (error) {
      console.error("Error saving caloric data:", error);
      setSuccessMessage("An error occurred while saving data.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6 mb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Calorie Calculator
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Determine your daily calorie needs and track your weight journey
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Calculate Your Needs
              </h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Gender
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value);
                      setResults(null);
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Weight (kg)
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      setResults(null);
                    }}
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                  )}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Height (cm)
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      setResults(null);
                    }}
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                  )}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Age
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setResults(null);
                    }}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Activity Level
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityLevel}
                    onChange={(e) => {
                      setActivityLevel(e.target.value);
                      setResults(null);
                    }}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light Activity</option>
                    <option value="moderate">Moderate Activity</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                  {errors.activityLevel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.activityLevel}
                    </p>
                  )}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Goal
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={goal}
                    onChange={handleGoalChange}
                  >
                    <option value="">Select Goal</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="weight_gain">Weight Gain</option>
                  </select>
                  {errors.goal && (
                    <p className="text-red-500 text-sm mt-1">{errors.goal}</p>
                  )}
                </label>
              </div>

              {(goal === "weight_loss" || goal === "weight_gain") && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Specific Goal
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={specificGoal}
                      onChange={(e) => setSpecificGoal(e.target.value)}
                    >
                      <option value="">Select Specific Goal</option>
                      {goal === "weight_loss" && (
                        <>
                          <option value="mild_weight_loss">
                            Mild Weight Loss (0.25 kg/week)
                          </option>
                          <option value="weight_loss">
                            Weight Loss (0.5 kg/week)
                          </option>
                          <option value="extreme_weight_loss">
                            Extreme Weight Loss (1 kg/week)
                          </option>
                        </>
                      )}
                      {goal === "weight_gain" && (
                        <>
                          <option value="mild_weight_gain">
                            Mild Weight Gain (0.25 kg/week)
                          </option>
                          <option value="weight_gain">
                            Weight Gain (0.5 kg/week)
                          </option>
                          <option value="extreme_weight_gain">
                            Extreme Weight Gain (1 kg/week)
                          </option>
                        </>
                      )}
                    </select>
                    {errors.specificGoal && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.specificGoal}
                      </p>
                    )}
                  </label>
                </div>
              )}

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                onClick={handleCalculate}
              >
                Calculate
              </button>

              {results && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-blue-800 mb-3">
                    Your Results
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-1">BMR</p>
                      <p className="font-bold text-lg">
                        {results.bmr} kcal/day
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-1">TDEE</p>
                      <p className="font-bold text-lg">
                        {results.tdee} kcal/day
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm text-center">
                      <p className="text-sm text-gray-500 mb-1">Target</p>
                      <p className="font-bold text-lg text-blue-600">
                        {results.targetCalories} kcal/day
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 mt-4 rounded-md transition-colors duration-200"
                    onClick={handleSave}
                  >
                    Save to Profile
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                  {successMessage}
                </div>
              )}
            </div>
          </div>

          {/* Information and Weight Tracking Columns */}
          <div className="lg:col-span-2">
            {/* Information Cards */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                What These Numbers Mean
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">BMR</h3>
                  <p className="text-gray-700">
                    Your Basal Metabolic Rate represents the number of calories
                    your body burns at rest to maintain basic functions like
                    breathing, circulation, and cell production.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">TDEE</h3>
                  <p className="text-gray-700">
                    Your Total Daily Energy Expenditure is the total number of
                    calories you burn in a day, including all activities such as
                    walking, exercising, and daily tasks.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">
                    Calorie Target
                  </h3>
                  <p className="text-gray-700">
                    <strong>Maintain:</strong> Matches your TDEE
                    <br />
                    <strong>Lose Weight:</strong> Below TDEE
                    <br />
                    <strong>Gain Weight:</strong> Above TDEE
                  </p>
                </div>
              </div>
            </div>

            {/* Weight Tracking Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Track Your Weight
                  </h2>
                  <p className="text-gray-600">
                    Current streak:{" "}
                    <span className="font-semibold text-blue-600">
                      {streak} days
                    </span>
                  </p>
                </div>

                <button
                  className={`px-4 py-2 rounded-md ${
                    deleteMode
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  onClick={() => setDeleteMode(!deleteMode)}
                >
                  {deleteMode ? "Exit Delete Mode" : "Delete Entries"}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <input
                  type="number"
                  placeholder="Enter weight (kg)"
                  className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                  onClick={handleAddWeightEntry}
                >
                  Add Entry
                </button>
              </div>

              {/* Delete All button (only in delete mode) */}
              {deleteMode && weightEntries.length > 0 && (
                <div className="mb-6">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                    onClick={handleDeleteAllWeightEntries}
                  >
                    Delete All Entries
                  </button>
                </div>
              )}

              {/* Weight entries list (only in delete mode) */}
              {deleteMode && weightEntries.length > 0 && (
                <div className="max-h-60 overflow-y-auto mb-6 bg-gray-50 rounded-md p-4">
                  <ul className="divide-y divide-gray-200">
                    {weightEntries.map((entry) => (
                      <li
                        key={entry._id}
                        className="py-2 flex justify-between items-center"
                      >
                        <span>
                          <span className="font-medium">
                            {new Date(entry.date).toLocaleDateString("en-GB")}
                          </span>{" "}
                          - {entry.weight} kg
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteWeightEntry(entry._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weight graph */}
              <div className="h-64 mb-6">
                {weightEntries.length > 0 ? (
                  <Line
                    data={{
                      labels: weightEntries.map((entry) =>
                        new Date(entry.date).toLocaleDateString("en-GB")
                      ),
                      datasets: [
                        {
                          label: "Weight Over Time",
                          data: weightEntries.map((entry) => entry.weight),
                          fill: false,
                          borderColor: "#3B82F6",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          tension: 0.1,
                          pointBackgroundColor: "#3B82F6",
                          pointRadius: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(17, 24, 39, 0.9)",
                          titleFont: {
                            family: "'Inter', sans-serif",
                            size: 14,
                          },
                          bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 13,
                          },
                          padding: 12,
                          displayColors: false,
                        },
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: "Weight (kg)",
                            font: {
                              family: "'Inter', sans-serif",
                            },
                          },
                          ticks: {
                            font: {
                              family: "'Inter', sans-serif",
                            },
                          },
                        },
                        x: {
                          ticks: {
                            font: {
                              family: "'Inter', sans-serif",
                            },
                            maxRotation: 45,
                            minRotation: 45,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        ></path>
                      </svg>
                      <p className="mt-2 text-gray-500">
                        No weight entries yet
                      </p>
                      <p className="text-sm text-gray-400">
                        Add your first entry above
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Export/Import buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                  onClick={handleDownloadCSV}
                >
                  Download CSV
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 w-full cursor-pointer z-10"
                    onChange={handleUploadCSV}
                  />
                  <button className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    Upload CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
