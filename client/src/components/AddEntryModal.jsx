// src/components/AddEntryModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Train, MapPin, Clock, Calendar, FileText, Save, Loader2, Pencil 
} from 'lucide-react';
import { DatePicker, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../utils/api';

const AddEntryModal = ({ isOpen, onClose, onRefresh, initialData }) => {
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

  // ✅ Effect to pre-fill form when initialData is provided (Edit Mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setIsStay(initialData.isStay || false);
      setFormData({
        date: initialData.date ? dayjs(initialData.date) : null,
        trainNo: initialData.trainNo || '',
        depTime: initialData.depTime ? dayjs(initialData.depTime, 'HH:mm') : null,
        arrTime: initialData.arrTime ? dayjs(initialData.arrTime, 'HH:mm') : null,
        fromStation: initialData.fromStation || '',
        toStation: initialData.toStation || '',
        objectOfJourney: initialData.objectOfJourney || ''
      });
    } else if (isOpen && !initialData) {
      resetForm(); // Ensure form is fresh for "Add New"
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date) return message.error('Please select a date');
    if (!formData.fromStation) return message.error('Please enter station/location');
    if (!formData.objectOfJourney) return message.error('Please enter purpose');

    setLoading(true);
    
    const payload = {
      ...formData,
      date: formData.date.format('YYYY-MM-DD'),
      depTime: formData.depTime ? formData.depTime.format('HH:mm') : null,
      arrTime: formData.arrTime ? formData.arrTime.format('HH:mm') : null,
      isStay
    };

    try {
      let res;
      if (initialData?._id) {
        // ✅ Call Update API if editing
        res = await api.updateEntry(initialData._id, payload);
      } else {
        // ✅ Call Add API if creating new
        res = await api.addEntry(payload);
      }

      if (res.ok) {
        message.success(initialData ? 'Entry updated!' : 'Entry added!');
        onRefresh();
        onClose();
      } else {
        message.error('Operation failed');
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          
          {/* Header - Dynamic Title and Icon */}
          <div className={`px-6 py-4 flex items-center justify-between text-white ${initialData ? 'bg-amber-500' : 'bg-blue-600'}`}>
            <div className="flex items-center space-x-3">
              {initialData ? <Pencil className="h-6 w-6" /> : <Save className="h-6 w-6" />}
              <h2 className="text-xl font-semibold">
                {initialData ? 'Edit Entry' : 'Add New Entry'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Entry Type Toggle */}
            <div className="flex items-center justify-center space-x-4 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setIsStay(false)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${!isStay ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                <Train className="h-4 w-4" /> <span>Journey</span>
              </button>
              <button
                type="button"
                onClick={() => setIsStay(true)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${isStay ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                <MapPin className="h-4 w-4" /> <span>Stay</span>
              </button>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Date
              </label>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                className="w-full !py-3"
                size="large"
                placeholder="Select journey date"
              />
            </div>

            {/* Conditional Fields */}
            {!isStay && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Train className="h-4 w-4 text-blue-500" />
                    Train/Road No.
                  </label>
                  <input
                    type="text"
                    name="trainNo"
                    value={formData.trainNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="e.g., 12721 or By Road"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      Dep Time
                    </label>
                    <TimePicker 
                      value={formData.depTime} 
                      onChange={(t) => setFormData(p => ({ ...p, depTime: t }))} 
                      format="HH:mm" 
                      className="w-full" 
                      size="large"
                      placeholder="--:--"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      Arr Time
                    </label>
                    <TimePicker 
                      value={formData.arrTime} 
                      onChange={(t) => setFormData(p => ({ ...p, arrTime: t }))} 
                      format="HH:mm" 
                      className="w-full" 
                      size="large"
                      placeholder="--:--"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Stations */}
            <div className={`grid ${isStay ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  {isStay ? 'Location' : 'From'}
                </label>
                <input 
                  type="text" 
                  name="fromStation" 
                  value={formData.fromStation} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder={isStay ? "e.g., NED " : "e.g., NED"}
                />
              </div>
              {!isStay && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    To
                  </label>
                  <input 
                    type="text" 
                    name="toStation" 
                    value={formData.toStation} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="e.g., WIPR"
                  />
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Object of Journey
              </label>
              <textarea 
                name="objectOfJourney" 
                value={formData.objectOfJourney} 
                onChange={handleChange} 
                rows={3} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="e.g., Official meeting, Training session, Site visit..."
              />
            </div>

            {/* Footer */}
            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-white rounded-lg font-medium transition-all ${
                  initialData 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>{initialData ? 'Update Entry' : 'Save Entry'}</span>
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