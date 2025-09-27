import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Phone,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Appointments = () => {
  const { 
    appointments, 
    upcomingAppointments, 
    bookAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    fetchAppointments,
    isLoading 
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list or calendar

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Mock appointment data
  const mockAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Rajesh Sharma',
      specialty: 'Ayurvedic Physician',
      dateTime: new Date('2024-02-15T10:00:00'),
      duration: 45,
      type: 'video',
      status: 'confirmed',
      reason: 'Follow-up consultation',
      notes: 'Review progress on digestive health improvements',
      location: 'Video Call',
      doctorImage: null,
      canReschedule: true,
      canCancel: true
    },
    {
      id: 2,
      doctorName: 'Dr. Priya Patel',
      specialty: 'Panchakarma Specialist',
      dateTime: new Date('2024-02-18T14:30:00'),
      duration: 60,
      type: 'in-person',
      status: 'confirmed',
      reason: 'Panchakarma treatment consultation',
      notes: 'Discuss detox program options',
      location: 'AyurSutra Wellness Center, Mumbai',
      address: '123 Wellness Street, Bandra West, Mumbai 400050',
      doctorImage: null,
      canReschedule: true,
      canCancel: true
    },
    {
      id: 3,
      doctorName: 'Dr. Amit Kumar',
      specialty: 'Ayurvedic Cardiologist',
      dateTime: new Date('2024-02-10T09:15:00'),
      duration: 30,
      type: 'video',
      status: 'completed',
      reason: 'Heart health assessment',
      notes: 'Discussed stress management techniques',
      location: 'Video Call',
      doctorImage: null,
      canReschedule: false,
      canCancel: false
    },
    {
      id: 4,
      doctorName: 'Dr. Meera Singh',
      specialty: 'Ayurvedic Dermatologist',
      dateTime: new Date('2024-02-22T11:00:00'),
      duration: 40,
      type: 'in-person',
      status: 'pending',
      reason: 'Skin health consultation',
      notes: 'Natural skincare and dosha-based treatments',
      location: 'AyurSutra Clinic, Delhi',
      address: '456 Health Plaza, CP, New Delhi 110001',
      doctorImage: null,
      canReschedule: true,
      canCancel: true
    },
    {
      id: 5,
      doctorName: 'Dr. Vikram Joshi',
      specialty: 'Ayurvedic Orthopedist',
      dateTime: new Date('2024-01-28T16:00:00'),
      duration: 50,
      type: 'video',
      status: 'cancelled',
      reason: 'Joint pain management',
      notes: 'Cancelled due to doctor unavailability',
      location: 'Video Call',
      doctorImage: null,
      canReschedule: false,
      canCancel: false
    }
  ];

  const allAppointments = appointments.length > 0 ? appointments : mockAppointments;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'rescheduled':
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-orange-100 text-orange-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTabAppointments = (tab) => {
    const now = new Date();
    switch (tab) {
      case 'upcoming':
        return allAppointments.filter(apt => 
          new Date(apt.dateTime) > now && ['confirmed', 'pending'].includes(apt.status)
        );
      case 'past':
        return allAppointments.filter(apt => 
          new Date(apt.dateTime) < now || apt.status === 'completed'
        );
      case 'cancelled':
        return allAppointments.filter(apt => apt.status === 'cancelled');
      default:
        return allAppointments;
    }
  };

  const filteredAppointments = getTabAppointments(activeTab).filter(appointment => {
    const matchesSearch = appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || appointment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const result = await cancelAppointment(appointmentId);
      if (result.success) {
        fetchAppointments();
      }
    }
  };

  const handleRescheduleAppointment = async (appointmentId, newDateTime) => {
    const result = await rescheduleAppointment(appointmentId, newDateTime);
    if (result.success) {
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: getTabAppointments('upcoming').length },
    { id: 'past', label: 'Past', count: getTabAppointments('past').length },
    { id: 'cancelled', label: 'Cancelled', count: getTabAppointments('cancelled').length }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage your healthcare appointments</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              icon={viewMode === 'list' ? Calendar : Clock}
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            >
              {viewMode === 'list' ? 'Calendar View' : 'List View'}
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowBookingModal(true)}
            >
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search appointments..."
                leftIcon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="sm" icon={Filter}>
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{allAppointments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{getTabAppointments('upcoming').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Video Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allAppointments.filter(apt => apt.type === 'video').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In-Person</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allAppointments.filter(apt => apt.type === 'in-person').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Appointments Content */}
          <div className="divide-y divide-gray-200">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.dateTime);
                const isUpcoming = new Date(appointment.dateTime) > new Date();
                
                return (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      {/* Doctor Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{time} ({appointment.duration} min)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.type === 'video' ? (
                              <Video className="w-4 h-4 text-gray-400" />
                            ) : (
                              <MapPin className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-600 truncate">{appointment.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Reason:</span>
                            <span className="text-sm text-gray-600">{appointment.reason}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}

                        {appointment.address && appointment.type === 'in-person' && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {appointment.address}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          {appointment.status === 'confirmed' && isUpcoming && (
                            <>
                              {appointment.type === 'video' && (
                                <Button variant="primary" size="sm" icon={Video}>
                                  Join Call
                                </Button>
                              )}
                              <Button variant="outline" size="sm" icon={Phone}>
                                Call Clinic
                              </Button>
                            </>
                          )}
                          
                          {appointment.canReschedule && isUpcoming && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Edit3}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowRescheduleModal(true);
                              }}
                            >
                              Reschedule
                            </Button>
                          )}
                          
                          {appointment.canCancel && isUpcoming && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Trash2}
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}

                          {appointment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              View Summary
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus ? 'No appointments found' : 'No appointments scheduled'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus 
                    ? 'Try adjusting your search or filters.' 
                    : 'Book your first appointment to get started with your wellness journey.'
                  }
                </p>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Appointment
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Book Appointment Modal */}
        {showBookingModal && (
          <Modal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            title="Book New Appointment"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                    <option value="">Choose a doctor</option>
                    <option value="dr-sharma">Dr. Rajesh Sharma - General Ayurveda</option>
                    <option value="dr-patel">Dr. Priya Patel - Panchakarma</option>
                    <option value="dr-kumar">Dr. Amit Kumar - Cardiology</option>
                    <option value="dr-singh">Dr. Meera Singh - Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                    <option value="video">Video Consultation</option>
                    <option value="in-person">In-Person Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea 
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Please describe your health concerns or reason for the appointment..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Book Appointment
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedAppointment && (
          <Modal
            isOpen={showRescheduleModal}
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedAppointment(null);
            }}
            title="Reschedule Appointment"
            size="md"
          >
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Appointment</h4>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.doctorName} - {formatDateTime(selectedAppointment.dateTime).date} at {formatDateTime(selectedAppointment.dateTime).time}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Time
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500">
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rescheduling (Optional)
                </label>
                <textarea 
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Please let us know why you need to reschedule..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Reschedule Appointment
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;