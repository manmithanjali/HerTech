"import React, { useState, useEffect } from 'react';
import { Plus, User, Edit, Trash2, Users } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfileHub = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    conditions: '',
    goals: ''
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await axios.get(`${API}/profiles`);
      setProfiles(response.data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const profileData = {
      name: formData.name,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      gender: formData.gender,
      conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
      goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : []
    };

    try {
      if (editingProfile) {
        await axios.put(`${API}/profiles/${editingProfile.id}`, profileData);
      } else {
        await axios.post(`${API}/profiles`, profileData);
      }
      
      loadProfiles();
      resetForm();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      weight: profile.weight.toString(),
      height: profile.height.toString(),
      gender: profile.gender,
      conditions: profile.conditions.join(', '),
      goals: profile.goals.join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await axios.delete(`${API}/profiles/${profileId}`);
        loadProfiles();
      } catch (error) {
        console.error('Failed to delete profile:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      weight: '',
      height: '',
      gender: 'male',
      conditions: '',
      goals: ''
    });
    setEditingProfile(null);
    setShowForm(false);
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6\">
      <div className=\"max-w-6xl mx-auto\">
        {/* Header */}
        <div className=\"text-center mb-8\">
          <div className=\"flex items-center justify-center mb-4\">
            <Users className=\"w-12 h-12 text-blue-600 mr-3\" />
            <h1 className=\"text-4xl font-bold text-gray-800\">AroMi Family Hub</h1>
          </div>
          <p className=\"text-gray-600\">Manage health profiles for your entire family</p>
        </div>

        {/* Add Profile Button */}
        {!showForm && (
          <div className=\"text-center mb-8\">
            <button
              data-testid=\"add-profile-button\"
              onClick={() => setShowForm(true)}
              className=\"inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg\"
            >
              <Plus className=\"w-5 h-5 mr-2\" />
              Add Family Member
            </button>
          </div>
        )}

        {/* Profile Form */}
        {showForm && (
          <div className=\"bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200\" data-testid=\"profile-form\">
            <h2 className=\"text-2xl font-bold mb-6 text-gray-800\">
              {editingProfile ? 'Edit Profile' : 'Create New Profile'}
            </h2>
            
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Name *</label>
                  <input
                    type=\"text\"
                    data-testid=\"profile-name-input\"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Age *</label>
                  <input
                    type=\"number\"
                    data-testid=\"profile-age-input\"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    required
                    min=\"1\"
                    max=\"120\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Weight (kg) *</label>
                  <input
                    type=\"number\"
                    data-testid=\"profile-weight-input\"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    required
                    step=\"0.1\"
                    min=\"1\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Height (cm) *</label>
                  <input
                    type=\"number\"
                    data-testid=\"profile-height-input\"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    required
                    step=\"0.1\"
                    min=\"1\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Gender *</label>
                  <select
                    data-testid=\"profile-gender-select\"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    required
                  >
                    <option value=\"male\">Male</option>
                    <option value=\"female\">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  Health Conditions (comma-separated)
                </label>
                <input
                  type=\"text\"
                  data-testid=\"profile-conditions-input\"
                  value={formData.conditions}
                  onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                  placeholder=\"e.g., diabetes, hypertension\"
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  Fitness Goals (comma-separated)
                </label>
                <input
                  type=\"text\"
                  data-testid=\"profile-goals-input\"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder=\"e.g., weight loss, muscle gain, endurance\"
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                />
              </div>

              <div className=\"flex gap-3 pt-4\">
                <button
                  type=\"submit\"
                  data-testid=\"save-profile-button\"
                  className=\"flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition\"
                >
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
                <button
                  type=\"button\"
                  data-testid=\"cancel-profile-button\"
                  onClick={resetForm}
                  className=\"flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition\"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profiles Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\" data-testid=\"profiles-grid\">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className=\"bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition cursor-pointer\"
              data-testid={`profile-card-${profile.id}`}
            >
              <div className=\"flex items-start justify-between mb-4\">
                <div className=\"flex items-center\">
                  <div className=\"w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center\">
                    <User className=\"w-6 h-6 text-blue-600\" />
                  </div>
                  <div className=\"ml-3\">
                    <h3 className=\"text-lg font-bold text-gray-800\">{profile.name}</h3>
                    <p className=\"text-sm text-gray-500\">{profile.age} years old</p>
                  </div>
                </div>
              </div>

              <div className=\"space-y-2 mb-4 text-sm text-gray-600\">
                <p><span className=\"font-medium\">Weight:</span> {profile.weight} kg</p>
                <p><span className=\"font-medium\">Height:</span> {profile.height} cm</p>
                <p><span className=\"font-medium\">Gender:</span> {profile.gender}</p>
                {profile.conditions.length > 0 && (
                  <p><span className=\"font-medium\">Conditions:</span> {profile.conditions.join(', ')}</p>
                )}
                {profile.goals.length > 0 && (
                  <p><span className=\"font-medium\">Goals:</span> {profile.goals.join(', ')}</p>
                )}
              </div>

              <div className=\"flex gap-2 pt-4 border-t border-gray-200\">
                <button
                  data-testid={`view-dashboard-${profile.id}`}
                  onClick={() => onSelectProfile(profile)}
                  className=\"flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm\"
                >
                  View Dashboard
                </button>
                <button
                  data-testid={`edit-profile-${profile.id}`}
                  onClick={() => handleEdit(profile)}
                  className=\"px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition\"
                >
                  <Edit className=\"w-4 h-4\" />
                </button>
                <button
                  data-testid={`delete-profile-${profile.id}`}
                  onClick={() => handleDelete(profile.id)}
                  className=\"px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition\"
                >
                  <Trash2 className=\"w-4 h-4\" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {profiles.length === 0 && !showForm && (
          <div className=\"text-center py-12\">
            <User className=\"w-16 h-16 text-gray-300 mx-auto mb-4\" />
            <p className=\"text-gray-500 text-lg\">No profiles yet. Add your first family member!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHub;
"