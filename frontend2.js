"import React, { useState } from 'react';
import { Dumbbell, Utensils, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlanGenerator = ({ profile, onBack, onPlanGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    duration_days: 7,
    workout_intensity: 'medium',
    include_workout: true,
    include_nutrition: true
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/generate-plan`, {
        profile_id: profile.id,
        ...formData
      });

      alert('Plans generated successfully!');
      onPlanGenerated(response.data);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6\">
      <div className=\"max-w-4xl mx-auto\">
        {/* Header */}
        <button
          onClick={onBack}
          data-testid=\"back-to-dashboard-button\"
          className=\"flex items-center text-gray-600 hover:text-gray-800 mb-6 transition\"
        >
          <ArrowLeft className=\"w-5 h-5 mr-2\" />
          Back to Dashboard
        </button>

        <div className=\"text-center mb-8\">
          <h1 className=\"text-4xl font-bold text-gray-800 mb-2\">Generate Your Plan</h1>
          <p className=\"text-gray-600\">Creating personalized plan for <span className=\"font-semibold text-blue-600\">{profile.name}</span></p>
        </div>

        {/* Form */}
        <div className=\"bg-white rounded-xl shadow-xl p-8 border border-gray-200\" data-testid=\"plan-generator-form\">
          <form onSubmit={handleGenerate} className=\"space-y-6\">
            {/* Duration */}
            <div>
              <label className=\"block text-lg font-medium text-gray-700 mb-3\">
                <Calendar className=\"w-5 h-5 inline mr-2\" />
                Plan Duration
              </label>
              <div className=\"flex items-center gap-4\">
                <input
                  type=\"number\"
                  data-testid=\"plan-duration-input\"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                  min=\"1\"
                  max=\"90\"
                  className=\"w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg\"
                  required
                />
                <span className=\"text-gray-600 text-lg\">days</span>
              </div>
              <p className=\"text-sm text-gray-500 mt-2\">Choose between 1-90 days (Default: 7 days)</p>
            </div>

            {/* Workout Intensity */}
            <div>
              <label className=\"block text-lg font-medium text-gray-700 mb-3\">
                <TrendingUp className=\"w-5 h-5 inline mr-2\" />
                Workout Intensity
              </label>
              <div className=\"grid grid-cols-3 gap-4\">
                {['low', 'medium', 'high'].map((intensity) => (
                  <button
                    key={intensity}
                    type=\"button\"
                    data-testid={`intensity-${intensity}-button`}
                    onClick={() => setFormData({...formData, workout_intensity: intensity})}
                    className={`px-6 py-4 rounded-lg border-2 transition ${
                      formData.workout_intensity === intensity
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Type Selection */}
            <div>
              <label className=\"block text-lg font-medium text-gray-700 mb-3\">Plan Components</label>
              
              <div className=\"space-y-3\">
                <label className=\"flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-300 transition\">
                  <input
                    type=\"checkbox\"
                    data-testid=\"include-workout-checkbox\"
                    checked={formData.include_workout}
                    onChange={(e) => setFormData({...formData, include_workout: e.target.checked})}
                    className=\"w-5 h-5 text-purple-600 rounded\"
                  />
                  <div className=\"ml-4 flex items-center\">
                    <Dumbbell className=\"w-5 h-5 text-purple-600 mr-2\" />
                    <span className=\"text-gray-700 font-medium\">Include Workout Plan</span>
                  </div>
                </label>

                <label className=\"flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-300 transition\">
                  <input
                    type=\"checkbox\"
                    data-testid=\"include-nutrition-checkbox\"
                    checked={formData.include_nutrition}
                    onChange={(e) => setFormData({...formData, include_nutrition: e.target.checked})}
                    className=\"w-5 h-5 text-purple-600 rounded\"
                  />
                  <div className=\"ml-4 flex items-center\">
                    <Utensils className=\"w-5 h-5 text-green-600 mr-2\" />
                    <span className=\"text-gray-700 font-medium\">Include Nutrition Plan</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Profile Summary */}
            <div className=\"bg-gray-50 rounded-lg p-6 border border-gray-200\">
              <h3 className=\"font-semibold text-gray-800 mb-3\">Profile Summary</h3>
              <div className=\"grid grid-cols-2 gap-3 text-sm\">
                <p><span className=\"text-gray-600\">Age:</span> <span className=\"font-medium\">{profile.age} years</span></p>
                <p><span className=\"text-gray-600\">Weight:</span> <span className=\"font-medium\">{profile.weight} kg</span></p>
                <p><span className=\"text-gray-600\">Height:</span> <span className=\"font-medium\">{profile.height} cm</span></p>
                <p><span className=\"text-gray-600\">Gender:</span> <span className=\"font-medium\">{profile.gender}</span></p>
              </div>
              {profile.conditions.length > 0 && (
                <p className=\"mt-3 text-sm\">
                  <span className=\"text-gray-600\">Conditions:</span> 
                  <span className=\"font-medium ml-2\">{profile.conditions.join(', ')}</span>
                </p>
              )}
              {profile.goals.length > 0 && (
                <p className=\"mt-2 text-sm\">
                  <span className=\"text-gray-600\">Goals:</span> 
                  <span className=\"font-medium ml-2\">{profile.goals.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              type=\"submit\"
              data-testid=\"generate-plan-button\"
              disabled={loading || (!formData.include_workout && !formData.include_nutrition)}
              className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition ${
                loading || (!formData.include_workout && !formData.include_nutrition)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'
              }`}
            >
              {loading ? (
                <span className=\"flex items-center justify-center\">
                  <svg className=\"animate-spin h-5 w-5 mr-3\" viewBox=\"0 0 24 24\">
                    <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\" fill=\"none\" />
                    <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\" />
                  </svg>
                  Generating AI-Powered Plan...
                </span>
              ) : (
                'Generate Personalized Plan'
              )}
            </button>

            {!formData.include_workout && !formData.include_nutrition && (
              <p className=\"text-red-600 text-sm text-center\">Please select at least one plan component</p>
            )}
          </form>
        </div>

        {/* Info */}
        <div className=\"mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200\">
          <h3 className=\"font-semibold text-blue-900 mb-2\">🤖 AI-Powered Personalization</h3>
          <p className=\"text-blue-800 text-sm\">
            Our AI considers your age, weight, health conditions, and goals to create a plan that's perfectly tailored to you. 
            Plans are designed to be safe, effective, and achievable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanGenerator;
"