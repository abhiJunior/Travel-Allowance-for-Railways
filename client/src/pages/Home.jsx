// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  FileDown, 
  Calendar,
  Train,
  MapPin,
  Clock,
  TrendingUp,
  IndianRupee,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DatePicker, Table, message, Empty } from 'antd';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import { useAuth } from '../Context/AuthContext';
import ProfileModal from '../components/ProfileModal';
import AddEntryModal from "../components/AddEntryModal"


const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        {subtitle && (
          <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center mt-4 text-sm">
        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600 font-medium">{trend}</span>
      </div>
    )}
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchJournalData = async () => {
    setLoading(true);
    try {
      const res = await api.getJournal(month);
      const data = await res.json();
      if (res.ok) {
        setJournal(data.journal?.entries || []);
      } else {
        setJournal([]);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
      setJournal([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (monthYear) => {
    setPdfLoading(true);
    try {
      message.loading({ content: 'Generating PDF...', key: 'pdf' });
      const response = await api.downloadPdf(monthYear);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `TA_Journal_${monthYear}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success({ content: 'PDF Downloaded!', key: 'pdf' });
      } else {
        message.error({ content: 'Failed to generate PDF', key: 'pdf' });
      }
    } catch (e) {
      message.error({ content: 'Connection error', key: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setIsProfileIncomplete(true);
    }
    fetchJournalData();
  }, [month, user]);

  // Calculate stats
  const totalDays = journal.length;
  const stayDays = journal.filter(e => e.isStay).length;
  const journeyDays = totalDays - stayDays;
  const totalTA = journal.reduce((acc, e) => acc + (e.taRate || 0), 0);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: d => (
        <span className="font-medium text-gray-800">
          {dayjs(d).format('DD MMM YYYY')}
        </span>
      ),
      width: 130,
    },
    {
      title: 'Type',
      dataIndex: 'isStay',
      key: 'type',
      render: (isStay, record) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isStay 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {isStay ? (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              Stay
            </>
          ) : (
            <>
              <Train className="h-3 w-3 mr-1" />
              {record.trainNo || 'Journey'}
            </>
          )}
        </span>
      ),
      width: 120,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">{record.fromStation}</span>
          {!record.isStay && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">{record.toStation}</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => (
        record.isStay ? (
          <span className="text-gray-400">—</span>
        ) : (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{record.depTime || '—'} - {record.arrTime || '—'}</span>
          </div>
        )
      ),
      width: 130,
    },
    {
      title: 'Purpose',
      dataIndex: 'objectOfJourney',
      key: 'object',
      ellipsis: true,
      render: text => (
        <span className="text-gray-600 text-sm">{text}</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'taRate',
      key: 'amount',
      render: rate => (
        <span className="font-semibold text-green-600">
          ₹{rate || 0}
        </span>
      ),
      width: 100,
      align: 'right',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.fullName?.split(' ')[0] || 'User'}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your Travelling Allowance claims efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Entries"
            value={totalDays}
            subtitle={`For ${dayjs(month).format('MMMM YYYY')}`}
            icon={Calendar}
            color="text-blue-600"
          />
          <StatsCard
            title="Journey Days"
            value={journeyDays}
            subtitle="By train/road"
            icon={Train}
            color="text-indigo-600"
          />
          <StatsCard
            title="Stay Days"
            value={stayDays}
            subtitle="At field sites"
            icon={MapPin}
            color="text-purple-600"
          />
          <StatsCard
            title="Total TA"
            value={`₹${totalTA.toLocaleString()}`}
            subtitle="Claimable amount"
            icon={IndianRupee}
            color="text-green-600"
          />
        </div>

        {/* Journal Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">TA Journal</h2>
                  <p className="text-sm text-gray-500">
                    {dayjs(month).format('MMMM YYYY')} • {totalDays} entries
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <DatePicker
                  picker="month"
                  value={dayjs(month)}
                  onChange={(d) => setMonth(d.format('YYYY-MM'))}
                  className="!rounded-lg"
                  size="large"
                />
                
                <button
                  onClick={() => setIsEntryModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Entry</span>
                </button>
                
                <button
                  onClick={() => handleDownload(month)}
                  disabled={pdfLoading || journal.length === 0}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : journal.length === 0 ? (
              <div className="py-16">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">No entries for {dayjs(month).format('MMMM YYYY')}</p>
                      <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add your first entry
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <Table
                dataSource={journal}
                columns={columns}
                rowKey="_id"
                pagination={false}
                className="custom-table"
              />
            )}
          </div>

          {/* Footer Summary */}
          {journal.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-t border-green-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2 text-green-700">
                  <IndianRupee className="h-5 w-5" />
                  <span className="font-medium">Total Claimable Amount:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalTA.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        {!user?.isProfileComplete && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please complete your service details to generate official TA claim documents.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileIncomplete} 
        onComplete={() => setIsProfileIncomplete(false)} 
      />
      <AddEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onRefresh={fetchJournalData}
        monthYear={month}
      />
    </div>
  );
};

export default Home;
