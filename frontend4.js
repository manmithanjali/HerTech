"import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Dumbbell, Utensils, TrendingUp, Calendar, 
  CheckCircle2, Circle, Plus, Weight, Activity 
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ profile, onBack, onGeneratePlan }) => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [bmrData, setBmrData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load latest plans
      const plansResponse = await axios.get(`${API}/plans/${profile.id}/latest`);
      setWorkoutPlan(plansResponse.data.workout_plan);
      setNutritionPlan(plansResponse.data.nutrition_plan);

      // Load progress logs
      if (plansResponse.data.workout_plan) {
        const progressResponse = await axios.get(`${API}/progress/${profile.id}?plan_id=${plansResponse.data.workout_plan.id}`);
        setProgressLogs(progressResponse.data);
      }

      // Load weight history
      const weightResponse = await axios.get(`${API}/weight/${profile.id}`);
      setWeightHistory(weightResponse.data);

      // Load BMR
      const bmrResponse = await axios.get(`${API}/bmr/${profile.id}`);
      setBmrData(bmrResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseToggle = async (exercise, day, completed) => {
    try {
      await axios.post(`${API}/progress`, {
        profile_id: profile.id,
        plan_id: workoutPlan.id,
        day: day,
        exercise_name: exercise.name,
        completed: completed
      });
      
      // Reload progress
      const progressResponse = await axios.get(`${API}/progress/${profile.id}?plan_id=${workoutPlan.id}`);
      setProgressLogs(progressResponse.data);
    } catch (error) {
      console.error('Failed to log progress:', error);
    }
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/weight`, {
        profile_id: profile.id,
        weight: parseFloat(newWeight)
      });

      const weightResponse = await axios.get(`${API}/weight/${profile.id}`);
      setWeightHistory(weightResponse.data);
      
      setNewWeight('');
      setShowWeightForm(false);
      
      // Reload BMR
      const bmrResponse = await axios.get(`${API}/bmr/${profile.id}`);
      setBmrData(bmrResponse.data);
    } catch (error) {
      console.error('Failed to add weight entry:', error);
    }
  };

  const isExerciseCompleted = (exerciseName, day) => {
    return progressLogs.some(
      log => log.exercise_name === exerciseName && log.day === day && log.completed
    );
  };

  const getDayProgress = (day) => {
    const dayWorkout = workoutPlan?.daily_workouts.find(w => w.day === day);
    if (!dayWorkout) return 0;
    
    const totalExercises = dayWorkout.exercises.length;
    const completedExercises = dayWorkout.exercises.filter(ex => 
      isExerciseCompleted(ex.name, day)
    ).length;
    
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const weightChartData = weightHistory.map(entry => ({
    date: new Date(entry.logged_at).toLocaleDateString(),
    weight: entry.weight
  }));

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6\">
      <div className=\"max-w-7xl mx-auto\">
        {/* Header */}
        <button
          onClick={onBack}
          data-testid=\"back-to-profiles-button\"
          className=\"flex items-center text-gray-600 hover:text-gray-800 mb-6 transition\"
        >
          <ArrowLeft className=\"w-5 h-5 mr-2\" />
          Back to Profiles
        </button>

        <div className=\"flex items-center justify-between mb-8\">
          <div>
            <h1 className=\"text-4xl font-bold text-gray-800 mb-2\">{profile.name}'s Dashboard</h1>
            <p className=\"text-gray-600\">Track your fitness journey</p>
          </div>
          <button
            onClick={onGeneratePlan}
            data-testid=\"generate-new-plan-button\"
            className=\"px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg\"
          >
            Generate New Plan
          </button>
        </div>

        {/* Stats Cards */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-8\">
          <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"current-weight-card\">
            <div className=\"flex items-center justify-between mb-2\">
              <Weight className=\"w-8 h-8 text-blue-600\" />
            </div>
            <p className=\"text-gray-600 text-sm\">Current Weight</p>
            <p className=\"text-3xl font-bold text-gray-800\">{profile.weight} kg</p>
          </div>

          <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"bmr-card\">
            <div className=\"flex items-center justify-between mb-2\">
              <Activity className=\"w-8 h-8 text-green-600\" />
            </div>
            <p className=\"text-gray-600 text-sm\">BMR</p>
            <p className=\"text-3xl font-bold text-gray-800\">{bmrData?.bmr.toFixed(0) || 0}</p>
            <p className=\"text-xs text-gray-500 mt-1\">kcal/day</p>
          </div>

          <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"tdee-card\">
            <div className=\"flex items-center justify-between mb-2\">
              <TrendingUp className=\"w-8 h-8 text-purple-600\" />
            </div>
            <p className=\"text-gray-600 text-sm\">TDEE</p>
            <p className=\"text-3xl font-bold text-gray-800\">{bmrData?.tdee.toFixed(0) || 0}</p>
            <p className=\"text-xs text-gray-500 mt-1\">kcal/day</p>
          </div>

          <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"plan-duration-card\">
            <div className=\"flex items-center justify-between mb-2\">
              <Calendar className=\"w-8 h-8 text-orange-600\" />
            </div>
            <p className=\"text-gray-600 text-sm\">Plan Duration</p>
            <p className=\"text-3xl font-bold text-gray-800\">{workoutPlan?.duration_days || 0}</p>
            <p className=\"text-xs text-gray-500 mt-1\">days</p>
          </div>
        </div>

        {/* No Plans Message */}
        {!workoutPlan && !nutritionPlan && (
          <div className=\"bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200 mb-8\">
            <Dumbbell className=\"w-16 h-16 text-gray-300 mx-auto mb-4\" />
            <h3 className=\"text-2xl font-bold text-gray-800 mb-2\">No Active Plans</h3>
            <p className=\"text-gray-600 mb-6\">Generate your first personalized workout and nutrition plan to get started!</p>
            <button
              onClick={onGeneratePlan}
              data-testid=\"generate-first-plan-button\"
              className=\"px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg\"
            >
              Generate Plan Now
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8\">
          {/* Workout Plan */}
          {workoutPlan && (
            <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"workout-plan-section\">
              <div className=\"flex items-center mb-6\">
                <Dumbbell className=\"w-6 h-6 text-purple-600 mr-2\" />
                <h2 className=\"text-2xl font-bold text-gray-800\">Workout Plan</h2>
              </div>

              {/* Day Selector */}
              <div className=\"flex gap-2 overflow-x-auto pb-4 mb-6\">
                {workoutPlan.daily_workouts.map((dayWorkout) => {
                  const progress = getDayProgress(dayWorkout.day);
                  return (
                    <button
                      key={dayWorkout.day}
                      data-testid={`day-${dayWorkout.day}-button`}
                      onClick={() => setSelectedDay(dayWorkout.day)}
                      className={`px-4 py-2 rounded-lg border-2 transition min-w-[80px] ${
                        selectedDay === dayWorkout.day
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className=\"text-sm\">Day {dayWorkout.day}</div>
                      <div className=\"text-xs mt-1\">{progress.toFixed(0)}%</div>
                    </button>
                  );
                })}
              </div>

              {/* Exercises */}
              {(() => {
                const dayWorkout = workoutPlan.daily_workouts.find(w => w.day === selectedDay);
                return dayWorkout ? (
                  <div>
                    <div className=\"bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200\">
                      <p className=\"text-purple-900 font-semibold\">Focus: {dayWorkout.focus}</p>
                    </div>
                    <div className=\"space-y-4\" data-testid=\"exercises-list\">
                      {dayWorkout.exercises.map((exercise, idx) => {
                        const completed = isExerciseCompleted(exercise.name, selectedDay);
                        return (
                          <div
                            key={idx}
                            data-testid={`exercise-${idx}`}
                            className={`p-4 rounded-lg border-2 transition ${
                              completed
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            <div className=\"flex items-start justify-between\">
                              <div className=\"flex-1\">
                                <h4 className=\"font-semibold text-gray-800 mb-2\">{exercise.name}</h4>
                                <div className=\"text-sm text-gray-600 space-y-1\">
                                  <p><span className=\"font-medium\">Sets:</span> {exercise.sets}</p>
                                  <p><span className=\"font-medium\">Reps:</span> {exercise.reps}</p>
                                  <p><span className=\"font-medium\">Rest:</span> {exercise.rest}</p>
                                  <p className=\"mt-2 text-gray-700\">{exercise.instructions}</p>
                                </div>
                              </div>
                              <button
                                data-testid={`exercise-toggle-${idx}`}
                                onClick={() => handleExerciseToggle(exercise, selectedDay, !completed)}
                                className=\"ml-4\"
                              >
                                {completed ? (
                                  <CheckCircle2 className=\"w-8 h-8 text-green-600\" />
                                ) : (
                                  <Circle className=\"w-8 h-8 text-gray-400 hover:text-green-600 transition\" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Nutrition Plan */}
          {nutritionPlan && (
            <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"nutrition-plan-section\">
              <div className=\"flex items-center mb-6\">
                <Utensils className=\"w-6 h-6 text-green-600 mr-2\" />
                <h2 className=\"text-2xl font-bold text-gray-800\">Nutrition Plan</h2>
              </div>

              {(() => {
                const dayMeal = nutritionPlan.daily_meals.find(m => m.day === selectedDay);
                return dayMeal ? (
                  <div className=\"space-y-4\" data-testid=\"nutrition-details\">
                    <div className=\"bg-green-50 rounded-lg p-4 border border-green-200\">
                      <h4 className=\"font-semibold text-green-900 mb-2\">Daily Macros</h4>
                      <div className=\"grid grid-cols-2 gap-2 text-sm\">
                        <p><span className=\"text-green-700\">Calories:</span> <span className=\"font-bold\">{dayMeal.total_calories}</span></p>
                        <p><span className=\"text-green-700\">Protein:</span> <span className=\"font-bold\">{dayMeal.protein}g</span></p>
                        <p><span className=\"text-green-700\">Carbs:</span> <span className=\"font-bold\">{dayMeal.carbs}g</span></p>
                        <p><span className=\"text-green-700\">Fat:</span> <span className=\"font-bold\">{dayMeal.fat}g</span></p>
                      </div>
                    </div>

                    <div className=\"space-y-3\">
                      <div className=\"p-4 bg-orange-50 rounded-lg border border-orange-200\">
                        <h4 className=\"font-semibold text-orange-900 mb-1\">Breakfast</h4>
                        <p className=\"text-gray-700\">{dayMeal.breakfast}</p>
                      </div>

                      <div className=\"p-4 bg-blue-50 rounded-lg border border-blue-200\">
                        <h4 className=\"font-semibold text-blue-900 mb-1\">Lunch</h4>
                        <p className=\"text-gray-700\">{dayMeal.lunch}</p>
                      </div>

                      <div className=\"p-4 bg-purple-50 rounded-lg border border-purple-200\">
                        <h4 className=\"font-semibold text-purple-900 mb-1\">Dinner</h4>
                        <p className=\"text-gray-700\">{dayMeal.dinner}</p>
                      </div>

                      <div className=\"p-4 bg-pink-50 rounded-lg border border-pink-200\">
                        <h4 className=\"font-semibold text-pink-900 mb-1\">Snacks</h4>
                        <ul className=\"list-disc list-inside text-gray-700\">
                          {dayMeal.snacks.map((snack, idx) => (
                            <li key={idx}>{snack}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className=\"text-gray-600\">Select a day to view nutrition plan</p>
                );
              })()}
            </div>
          )}
        </div>

        {/* Weight Tracking */}
        <div className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200\" data-testid=\"weight-tracking-section\">
          <div className=\"flex items-center justify-between mb-6\">
            <div className=\"flex items-center\">
              <Weight className=\"w-6 h-6 text-blue-600 mr-2\" />
              <h2 className=\"text-2xl font-bold text-gray-800\">Weight Tracking</h2>
            </div>
            <button
              data-testid=\"add-weight-button\"
              onClick={() => setShowWeightForm(!showWeightForm)}
              className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center\"
            >
              <Plus className=\"w-4 h-4 mr-2\" />
              Log Weight
            </button>
          </div>

          {showWeightForm && (
            <form onSubmit={handleWeightSubmit} className=\"mb-6 flex gap-3\" data-testid=\"weight-form\">
              <input
                type=\"number\"
                data-testid=\"weight-input\"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder=\"Enter weight (kg)\"
                step=\"0.1\"
                min=\"1\"
                required
                className=\"flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
              />
              <button
                type=\"submit\"
                data-testid=\"save-weight-button\"
                className=\"px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition\"
              >
                Save
              </button>
              <button
                type=\"button\"
                data-testid=\"cancel-weight-button\"
                onClick={() => {
                  setShowWeightForm(false);
                  setNewWeight('');
                }}
                className=\"px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition\"
              >
                Cancel
              </button>
            </form>
          )}

          {weightChartData.length > 0 ? (
            <ResponsiveContainer width=\"100%\" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray=\"3 3\" />
                <XAxis dataKey=\"date\" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type=\"monotone\" dataKey=\"weight\" stroke=\"#3B82F6\" strokeWidth={2} name=\"Weight (kg)\" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className=\"text-center py-12\">
              <Weight className=\"w-16 h-16 text-gray-300 mx-auto mb-4\" />
              <p className=\"text-gray-500\">No weight history yet. Start logging your weight!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
"