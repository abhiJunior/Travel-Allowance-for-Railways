// src/components/AddEntryModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Train, 
  MapPin, 
  Clock, 
  Calendar,
  FileText,
  Save,
  Loader2
} from 'lucide-react';
import { DatePicker, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../utils/api';

const AddEntryModal = ({ isOpen, onClose, onRefresh, monthYear }) => {
  const [isStay, setIsStay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: null,
    trainNo: '',
    depTime: null,
    arrTime: null,
    fromStation: '',
    toStation: '',
    objectOfJourney: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date) {
      message.error('Please select a date');
      return;
    }
    if (!formData.fromStation) {
      message.error('Please enter station/location');
      return;
    }
    if (!formData.objectOfJourney) {
      message.error('Please enter purpose of journey');
      return;
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      date: formData.date.format('YYYY-MM-DD'),
      depTime: formData.depTime ? formData.depTime.format('HH:mm') : null,
      arrTime: formData.arrTime ? formData.arrTime.format('HH:mm') : null,
      isStay
    };

    try {
      const res = await api.addEntry(payload);
      if (res.ok) {
        message.success('Entry added successfully!');
        resetForm();
        onRefresh();
        onClose();
      } else {
        message.error('Failed to add entry');
      }
    } catch (error) {
      message.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: null,
      trainNo: '',
      depTime: null,
      arrTime: null,
      fromStation: '',
      toStation: '',
      objectOfJourney: ''
    });
    setIsStay(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isStay ? (
                  <MapPin className="h-6 w-6 text-white" />
                ) : (
                  <Train className="h-6 w-6 text-white" />
                )}
                <h2 className="text-xl font-semibold text-white">
                  {isStay ? 'Add Stay Entry' : 'Add Journey Entry'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Entry Type Toggle */}
            <div className="flex items-center justify-center space-x-4 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setIsStay(false)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  !isStay 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Train className="h-4 w-4" />
                <span>Journey</span>
              </button>
              <button
                type="button"
                onClick={() => setIsStay(true)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  isStay 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Stay at Site</span>
              </button>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Date</span>
              </label>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                className="w-full !py-3 !rounded-lg"
                placeholder="Select date"
                size="large"
              />
            </div>

            {/* Journey Details (only for non-stay) */}
            {!isStay && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Train className="h-4 w-4 text-gray-400" />
                    <span>Train/Road Number</span>
                  </label>
                  <input
                    type="text"
                    name="trainNo"
                    value={formData.trainNo}
                    onChange={handleChange}
                    placeholder="e.g., 11001 or By Road"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Departure</span>
                    </label>
                    <TimePicker
                      value={formData.depTime}
                      onChange={(time) => setFormData(prev => ({ ...prev, depTime: time }))}
                      format="HH:mm"
                      className="w-full !py-3 !rounded-lg"
                      placeholder="Dep time"
                      size="large"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Arrival</span>
                    </label>
                    <TimePicker
                      value={formData.arrTime}
                      onChange={(time) => setFormData(prev => ({ ...prev, arrTime: time }))}
                      format="HH:mm"
                      className="w-full !py-3 !rounded-lg"
                      placeholder="Arr time"
                      size="large"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Stations */}
            <div className={`grid ${isStay ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{isStay ? 'Station/Location' : 'From Station'}</span>
                </label>
                <input
                  type="text"
                  name="fromStation"
                  value={formData.fromStation}
                  onChange={handleChange}
                  placeholder="e.g., NED"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              
              {!isStay && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>To Station</span>
                  </label>
                  <input
                    type="text"
                    name="toStation"
                    value={formData.toStation}
                    onChange={handleChange}
                    placeholder="e.g., WIRR"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Object of Journey</span>
              </label>
              <textarea
                name="objectOfJourney"
                value={formData.objectOfJourney}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., Worked on PQRS maintenance"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
