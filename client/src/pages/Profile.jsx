// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  CreditCard,
  Save,
  Edit3,
  Train,
  IndianRupee,
  Hash,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pfNumber: '',
    billUnitNo: '',
    designation: '',
    division: '',
    headquarters: '',
    railwayZone: '',
    rateOfPay: '',
    rate: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        pfNumber: user.pfNumber || '',
        billUnitNo: user.billUnitNo || '',
        designation: user.designation || '',
        division: user.division || '',
        headquarters: user.headquarters || '',
        railwayZone: user.railwayZone || '',
        rateOfPay: user.rateOfPay || '',
        rate: user.rate || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.updateProfile(formData);
      
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        message.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        message.error('Failed to update profile');
      }
    } catch (error) {
      message.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const profileFields = [
    { 
      section: 'Personal Information',
      fields: [
        { name: 'fullName', label: 'Full Name', icon: User, type: 'text' },
        { name: 'email', label: 'Email Address', icon: Mail, type: 'email', disabled: true },
        { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
      ]
    },
    {
      section: 'Service Details',
      fields: [
        { name: 'pfNumber', label: 'P.F. Number', icon: Hash, type: 'text' },
        { name: 'billUnitNo', label: 'Bill Unit No', icon: CreditCard, type: 'text' },
        { name: 'designation', label: 'Designation', icon: Briefcase, type: 'text' },
        { name: 'division', label: 'Division', icon: Building2, type: 'text' },
        { name: 'headquarters', label: 'Headquarters', icon: MapPin, type: 'text' },
        { name: 'railwayZone', label: 'Railway Zone', icon: Train, type: 'text' },
      ]
    },
    {
      section: 'Pay Details',
      fields: [
        { name: 'rateOfPay', label: 'Basic Pay (Rate of Pay)', icon: IndianRupee, type: 'number' },
        { name: 'rate', label: 'TA Per Day', icon: IndianRupee, type: 'number' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 md:h-32 md:w-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-4xl md:text-5xl">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {user?.fullName || 'Railway Employee'}
              </h1>
              <p className="text-blue-200 text-lg mb-3">
                {user?.designation || 'Designation not set'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                  <Hash className="h-3 w-3 mr-1" />
                  PF: {user?.pfNumber || 'N/A'}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user?.headquarters || 'HQ not set'}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                  <Train className="h-3 w-3 mr-1" />
                  {user?.railwayZone || 'Zone not set'}
                </span>
              </div>
            </div>

            {/* Profile Status */}
            <div className="flex flex-col items-center space-y-2">
              {user?.isProfileComplete ? (
                <div className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile Complete</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Incomplete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {profileFields.map(({ section, fields }) => (
              <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">{section}</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map(({ name, label, icon: Icon, type, disabled }) => (
                      <div key={name} className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span>{label}</span>
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          disabled={!isEditing || disabled}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isEditing && !disabled
                              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                          }`}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
