import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search,
  Filter,
  Calendar,
  User,
  Heart,
  Activity,
  Pill,
  TestTube,
  Eye,
  Plus,
  Trash2,
  Share
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const MedicalRecords = () => {
  const { 
    healthRecords, 
    prescriptions, 
    labReports, 
    fetchHealthRecords, 
    fetchPrescriptions, 
    fetchLabReports,
    uploadDocument,
    isLoading 
  } = useUserStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHealthRecords();
    fetchPrescriptions();
    fetchLabReports();
  }, [fetchHealthRecords, fetchPrescriptions, fetchLabReports]);

  // Mock data for demonstration
  const mockRecords = [
    {
      id: 1,
      type: 'consultation',
      title: 'Initial Ayurvedic Consultation',
      date: '2024-01-15',
      doctor: 'Dr. Rajesh Sharma',
      description: 'Comprehensive health assessment and dosha analysis',
      status: 'completed',
      attachments: ['consultation_notes.pdf'],
      details: {
        duration: '45 minutes',
        findings: 'Vata-Pitta constitution with mild digestive issues',
        recommendations: 'Dietary modifications and stress management'
      }
    },
    {
      id: 2,
      type: 'prescription',
      title: 'Ayurvedic Prescription - Digestive Health',
      date: '2024-01-15',
      doctor: 'Dr. Rajesh Sharma',
      description: 'Herbal medications for digestive improvement',
      status: 'active',
      attachments: ['prescription_jan_2024.pdf'],
      medications: [
        { name: 'Triphala Churna', dosage: '1 tsp twice daily', duration: '30 days' },
        { name: 'Ajwain Powder', dosage: '1/2 tsp after meals', duration: '15 days' }
      ]
    },
    {
      id: 3,
      type: 'lab_report',
      title: 'Blood Work - Complete Health Panel',
      date: '2024-01-10',
      lab: 'LifeCare Diagnostics',
      description: 'Comprehensive blood analysis including vitamin levels',
      status: 'completed',
      attachments: ['blood_report_jan_2024.pdf'],
      results: {
        hemoglobin: '13.5 g/dL',
        vitaminD: '25 ng/mL',
        vitaminB12: '350 pg/mL',
        thyroid: 'Normal'
      }
    },
    {
      id: 4,
      type: 'treatment',
      title: 'Panchakarma Treatment Plan',
      date: '2024-01-20',
      therapist: 'Ayurvedic Wellness Center',
      description: 'Customized detox and rejuvenation program',
      status: 'ongoing',
      attachments: ['treatment_plan.pdf'],
      sessions: [
        { name: 'Abhyanga', completed: 5, total: 7 },
        { name: 'Shirodhara', completed: 3, total: 5 },
        { name: 'Basti', completed: 0, total: 3 }
      ]
    },
    {
      id: 5,
      type: 'assessment',
      title: 'Dosha Re-assessment',
      date: '2024-01-25',
      practitioner: 'Dr. Priya Patel',
      description: 'Quarterly constitution review and lifestyle adjustments',
      status: 'completed',
      attachments: ['dosha_assessment_q1_2024.pdf'],
      results: {
        primaryDosha: 'Vata-Pitta',
        changes: 'Improved digestive fire, reduced stress levels',
        recommendations: 'Continue current regimen with seasonal adjustments'
      }
    }
  ];

  const allRecords = healthRecords.length > 0 ? healthRecords : mockRecords;

  const getRecordIcon = (type) => {
    const iconMap = {
      consultation: User,
      prescription: Pill,
      lab_report: TestTube,
      treatment: Heart,
      assessment: Activity,
      document: FileText
    };
    return iconMap[type] || FileText;
  };

  const getRecordColor = (type) => {
    const colorMap = {
      consultation: 'bg-blue-100 text-blue-700',
      prescription: 'bg-purple-100 text-purple-700',
      lab_report: 'bg-red-100 text-red-700',
      treatment: 'bg-green-100 text-green-700',
      assessment: 'bg-yellow-100 text-yellow-700',
      document: 'bg-gray-100 text-gray-700'
    };
    return colorMap[type] || colorMap.document;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || colorMap.pending;
  };

  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || record.type === activeTab;
    const matchesDate = !filterDate || record.date.includes(filterDate);
    const matchesType = !filterType || record.type === filterType;
    
    return matchesSearch && matchesTab && matchesDate && matchesType;
  });

  const tabs = [
    { id: 'all', label: 'All Records', count: allRecords.length },
    { id: 'consultation', label: 'Consultations', count: allRecords.filter(r => r.type === 'consultation').length },
    { id: 'prescription', label: 'Prescriptions', count: allRecords.filter(r => r.type === 'prescription').length },
    { id: 'lab_report', label: 'Lab Reports', count: allRecords.filter(r => r.type === 'lab_report').length },
    { id: 'treatment', label: 'Treatments', count: allRecords.filter(r => r.type === 'treatment').length }
  ];

  const handleUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', 'document');
      formData.append('title', file.name);
      
      await uploadDocument(formData);
    }
    setShowUploadModal(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600">Manage your health documents and reports</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              icon={Upload}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Document
            </Button>
            <Button
              variant="primary"
              icon={Plus}
            >
              Add Record
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search records..."
                leftIcon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="consultation">Consultations</option>
                <option value="prescription">Prescriptions</option>
                <option value="lab_report">Lab Reports</option>
                <option value="treatment">Treatments</option>
                <option value="assessment">Assessments</option>
              </select>
              <Button variant="outline" size="sm" icon={Filter}>
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200">
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

          {/* Records List */}
          <div className="divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const Icon = getRecordIcon(record.type);
                return (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-lg ${getRecordColor(record.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {record.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3">{record.description}</p>

                        {/* Record Details */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            {record.doctor && (
                              <div>
                                <span className="font-medium text-gray-700">Doctor: </span>
                                <span className="text-gray-600">{record.doctor}</span>
                              </div>
                            )}
                            {record.lab && (
                              <div>
                                <span className="font-medium text-gray-700">Lab: </span>
                                <span className="text-gray-600">{record.lab}</span>
                              </div>
                            )}
                            {record.practitioner && (
                              <div>
                                <span className="font-medium text-gray-700">Practitioner: </span>
                                <span className="text-gray-600">{record.practitioner}</span>
                              </div>
                            )}
                            {record.therapist && (
                              <div>
                                <span className="font-medium text-gray-700">Therapist: </span>
                                <span className="text-gray-600">{record.therapist}</span>
                              </div>
                            )}
                          </div>

                          {/* Specific Details by Type */}
                          {record.medications && (
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-700 mb-2">Medications:</h5>
                              <div className="space-y-1">
                                {record.medications.map((med, index) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    <strong>{med.name}</strong> - {med.dosage} for {med.duration}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.results && (
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-700 mb-2">Results:</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(record.results).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{key}:</span>
                                    <span className="font-medium text-gray-900">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.sessions && (
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-700 mb-2">Treatment Progress:</h5>
                              <div className="space-y-2">
                                {record.sessions.map((session, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{session.name}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">{session.completed}/{session.total}</span>
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full"
                                          style={{ width: `${(session.completed / session.total) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Attachments */}
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-700 mb-2">Attachments:</h5>
                            <div className="flex flex-wrap gap-2">
                              {record.attachments.map((file, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-blue-700">{file}</span>
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedRecord(record)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Download}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Share}
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterDate || filterType 
                    ? 'No records match your current filters.' 
                    : 'Start by uploading your first medical document.'
                  }
                </p>
                <Button
                  variant="primary"
                  icon={Upload}
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <Modal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            title="Upload Medical Document"
            size="md"
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your documents
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleUpload(Array.from(e.target.files))}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                </p>
              </div>
            </div>
          </Modal>
        )}

        {/* Record Detail Modal */}
        {selectedRecord && (
          <Modal
            isOpen={!!selectedRecord}
            onClose={() => setSelectedRecord(null)}
            title={selectedRecord.title}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-600">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{selectedRecord.description}</p>
              </div>

              {selectedRecord.details && (
                <div>
                  <span className="font-medium text-gray-700">Additional Details:</span>
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    {Object.entries(selectedRecord.details).map(([key, value]) => (
                      <div key={key} className="mb-2 last:mb-0">
                        <span className="font-medium text-gray-600 capitalize">{key}: </span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecords;