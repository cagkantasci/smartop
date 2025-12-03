
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, MapPin, Calendar, CheckCircle, AlertTriangle, Clock, X, Building2, Truck, User, Eye, Edit2, Trash2, Map, Navigation, Target, ChevronRight, Loader2, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Job, Machine, Operator, TranslationDictionary } from '../types';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for jobs and machines
const jobIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const machineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeMachineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface JobManagementProps {
  jobs: Job[];
  machines: Machine[];
  operators: Operator[];
  addJob: (job: Job) => void;
  updateJob?: (job: Job) => void;
  deleteJob?: (id: string) => void;
  t: TranslationDictionary['jobs'];
}

// Map center adjuster component
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const JobManagement: React.FC<JobManagementProps> = ({
  jobs,
  machines,
  operators,
  addJob,
  updateJob,
  deleteJob,
  t
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9334, 32.8597]); // Turkey center
  const [mapZoom, setMapZoom] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'Scheduled' as Job['status'],
    priority: 'medium' as Job['priority'],
    progress: 0,
    assignedMachineIds: [] as string[],
    assignedOperatorIds: [] as string[],
    coordinates: { lat: 41.0082, lng: 28.9784 } // Default Istanbul
  });

  // Calculate jobs and machines with coordinates
  const jobsWithCoords = jobs.filter(j => j.coordinates?.lat && j.coordinates?.lng);
  const machinesWithCoords = machines.filter(m => m.location?.lat && m.location?.lng);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [jobs, searchTerm, statusFilter, priorityFilter]);

  // Stats for filter badges
  const jobStats = useMemo(() => ({
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    scheduled: jobs.filter(j => j.status === 'Scheduled').length,
    delayed: jobs.filter(j => j.status === 'Delayed').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
  }), [jobs]);

  const handleMachineToggle = (machineId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedMachineIds.includes(machineId);
      if (isSelected) {
        return { ...prev, assignedMachineIds: prev.assignedMachineIds.filter(id => id !== machineId) };
      } else {
        return { ...prev, assignedMachineIds: [...prev.assignedMachineIds, machineId] };
      }
    });
  };

  const handleOperatorToggle = (operatorId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedOperatorIds.includes(operatorId);
      if (isSelected) {
        return { ...prev, assignedOperatorIds: prev.assignedOperatorIds.filter(id => id !== operatorId) };
      } else {
        return { ...prev, assignedOperatorIds: [...prev.assignedOperatorIds, operatorId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
        assignedMachineIds: formData.assignedMachineIds,
        assignedOperatorIds: formData.assignedOperatorIds,
        coordinates: formData.coordinates
      };

      addJob(newJob);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'Scheduled',
      priority: 'medium',
      progress: 0,
      assignedMachineIds: [],
      assignedOperatorIds: [],
      coordinates: { lat: 41.0082, lng: 28.9784 }
    });
  };

  const openDetailModal = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
    if (job.coordinates) {
      setMapCenter([job.coordinates.lat, job.coordinates.lng]);
      setMapZoom(14);
    }
  };

  // Open edit modal with job data
  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      location: job.location,
      startDate: job.startDate,
      endDate: job.endDate || '',
      status: job.status,
      priority: job.priority || 'medium',
      progress: job.progress,
      assignedMachineIds: job.assignedMachineIds,
      assignedOperatorIds: job.assignedOperatorIds || [],
      coordinates: job.coordinates || { lat: 41.0082, lng: 28.9784 }
    });
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !updateJob) return;

    setIsSubmitting(true);
    try {
      const updatedJob: Job = {
        ...selectedJob,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
        assignedMachineIds: formData.assignedMachineIds,
        assignedOperatorIds: formData.assignedOperatorIds,
        coordinates: formData.coordinates
      };

      updateJob(updatedJob);
      setIsEditModalOpen(false);
      setSelectedJob(null);
      resetForm();
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirm = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteConfirmOpen(true);
  };

  // Handle delete
  const handleDelete = () => {
    if (!jobToDelete || !deleteJob) return;
    deleteJob(jobToDelete.id);
    setIsDeleteConfirmOpen(false);
    setJobToDelete(null);
    // Close detail modal if open
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
      setSelectedJob(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Delayed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'In Progress': return t.status.inProgress;
      case 'Completed': return t.status.completed;
      case 'Delayed': return t.status.delayed;
      case 'Scheduled': return 'Planlandı';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'Acil';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
            <Building2 className="text-smart-yellow" />
            {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md border ${
              showMap
                ? 'bg-smart-yellow text-smart-navy border-smart-yellow'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-smart-yellow'
            }`}
          >
            <Map size={20} />
            {showMap ? 'Listeye Dön' : 'Harita Görünümü'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-smart-navy dark:bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md border border-transparent dark:border-gray-700"
          >
            <Plus size={20} strokeWidth={3} />
            {t.addJob}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="İş adı, konum veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-smart-navy/20 dark:focus:ring-gray-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border font-medium flex items-center gap-2 transition-colors ${
              showFilters || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'bg-smart-navy text-white border-smart-navy dark:bg-white dark:text-smart-navy'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-smart-navy dark:hover:border-gray-500'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filtreler
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <span className="w-5 h-5 rounded-full bg-smart-yellow text-smart-navy text-xs font-bold flex items-center justify-center">
                {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex flex-wrap gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Durum</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-smart-navy text-white dark:bg-white dark:text-smart-navy'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Tümü ({jobStats.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('In Progress')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'In Progress'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                    }`}
                  >
                    Devam Ediyor ({jobStats.inProgress})
                  </button>
                  <button
                    onClick={() => setStatusFilter('Scheduled')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'Scheduled'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                    }`}
                  >
                    Planlandı ({jobStats.scheduled})
                  </button>
                  <button
                    onClick={() => setStatusFilter('Delayed')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'Delayed'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
                    }`}
                  >
                    Gecikmede ({jobStats.delayed})
                  </button>
                  <button
                    onClick={() => setStatusFilter('Completed')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'Completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                    }`}
                  >
                    Tamamlandı ({jobStats.completed})
                  </button>
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Öncelik</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPriorityFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === 'all'
                        ? 'bg-smart-navy text-white dark:bg-white dark:text-smart-navy'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setPriorityFilter('urgent')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === 'urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100'
                    }`}
                  >
                    Acil
                  </button>
                  <button
                    onClick={() => setPriorityFilter('high')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === 'high'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100'
                    }`}
                  >
                    Yüksek
                  </button>
                  <button
                    onClick={() => setPriorityFilter('medium')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === 'medium'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100'
                    }`}
                  >
                    Orta
                  </button>
                  <button
                    onClick={() => setPriorityFilter('low')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === 'low'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Düşük
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {(statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-smart-navy dark:text-white">{filteredJobs.length}</span> sonuç bulundu
            {searchTerm && <span> - "{searchTerm}" araması için</span>}
          </p>
        )}
      </div>

      {/* Map View */}
      {showMap && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-smart-navy dark:text-white flex items-center gap-2">
                <Navigation size={20} className="text-smart-yellow" />
                İş ve Makine Konumları
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="inline-flex items-center gap-1 mr-4">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> İşler ({jobsWithCoords.length})
                </span>
                <span className="inline-flex items-center gap-1 mr-4">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Aktif Makineler
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Boşta Makineler
                </span>
              </p>
            </div>
          </div>
          <div className="h-[500px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Job Markers */}
              {jobsWithCoords.map(job => (
                <Marker
                  key={`job-${job.id}`}
                  position={[job.coordinates!.lat, job.coordinates!.lng]}
                  icon={jobIcon}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h4 className="font-bold text-smart-navy">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.location}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                        <span className="text-sm">{job.progress}%</span>
                      </div>
                      <button
                        onClick={() => openDetailModal(job)}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                      >
                        Detayları Gör
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Machine Markers */}
              {machinesWithCoords.map(machine => {
                const isActive = machine.status === 'Aktif';
                return (
                  <Marker
                    key={`machine-${machine.id}`}
                    position={[machine.location!.lat, machine.location!.lng]}
                    icon={isActive ? activeMachineIcon : machineIcon}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h4 className="font-bold text-smart-navy">{machine.name}</h4>
                        <p className="text-sm text-gray-500">{machine.brand} {machine.model}</p>
                        <p className="text-xs text-gray-400 mt-1">{machine.location?.address}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {machine.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Motor Saati: {machine.engineHours}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {!showMap && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                <Search size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Arama kriterlerinize uygun iş bulunamadı. Filtreleri temizlemeyi deneyin.
              </p>
              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-smart-navy text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : filteredJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-smart-navy dark:text-white mb-1">{job.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin size={14} /> {job.location}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                  {job.priority && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(job.priority)}`}>
                      {getPriorityLabel(job.priority)}
                    </span>
                  )}
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {job.description}
                </p>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  <span>İlerleme Durumu</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      job.status === 'Delayed' ? 'bg-red-500' :
                      job.status === 'Completed' ? 'bg-green-500' : 'bg-smart-success'
                    }`}
                    style={{width: `${job.progress}%`}}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-100 dark:border-slate-600">
                <h4 className="text-xs font-bold text-smart-navy dark:text-white uppercase mb-3 flex items-center gap-2">
                  <Truck size={14} />
                  Atanan Makineler ({job.assignedMachineIds.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.assignedMachineIds.map(mid => {
                    const machine = machines.find(m => m.id === mid);
                    const operator = operators.find(o => o.id === machine?.assignedOperatorId);
                    return machine ? (
                      <div key={mid} className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-600 dark:text-gray-200 text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1" title={operator ? `Op: ${operator.name}` : 'Operatör Yok'}>
                        <span>{machine.brand} {machine.model}</span>
                        {operator && <User size={10} className="text-gray-400" />}
                      </div>
                    ) : null;
                  })}
                  {job.assignedMachineIds.length === 0 && (
                    <span className="text-xs text-gray-400 italic">Henüz makine atanmadı.</span>
                  )}
                </div>
              </div>

              {/* Assigned Operators */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="text-xs font-bold text-smart-navy dark:text-white uppercase mb-3 flex items-center gap-2">
                  <User size={14} />
                  Atanan Operatörler ({job.assignedOperatorIds?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.assignedOperatorIds?.map(oid => {
                    const operator = operators.find(o => o.id === oid);
                    return operator ? (
                      <div key={oid} className="bg-white dark:bg-slate-600 border border-blue-200 dark:border-blue-700 text-gray-600 dark:text-gray-200 text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <User size={10} className="text-blue-500" />
                        <span>{operator.name}</span>
                      </div>
                    ) : null;
                  })}
                  {(!job.assignedOperatorIds || job.assignedOperatorIds.length === 0) && (
                    <span className="text-xs text-gray-400 italic">Henüz operatör atanmadı.</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>Başlangıç: <span className="font-bold text-smart-navy dark:text-white">{job.startDate}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetailModal(job)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    <Eye size={14} />
                    Detaylar
                  </button>
                  {updateJob && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(job); }}
                      className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 p-1.5 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {deleteJob && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteConfirm(job); }}
                      className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-2xl font-bold text-smart-navy dark:text-white flex items-center gap-2">
                <Building2 className="text-smart-yellow" />
                Yeni İş Ekle
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  İş Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="örn: Kuzey Otoyolu Viyadük İnşaatı"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                  rows={3}
                  placeholder="İş detaylarını girin..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Konum / Şantiye Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="örn: İstanbul, Levent Şantiyesi"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Enlem (Lat)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="41.0082"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Boylam (Lng)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="28.9784"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Job['status'] }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="Scheduled">Planlandı</option>
                    <option value="In Progress">Devam Ediyor</option>
                    <option value="Delayed">Gecikmede</option>
                    <option value="Completed">Tamamlandı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Job['priority'] }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  İlerleme: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Machine Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Makine Ata
                </label>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {machines.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">Henüz makine eklenmemiş.</p>
                  ) : (
                    <div className="space-y-2">
                      {machines.map(machine => (
                        <label
                          key={machine.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            formData.assignedMachineIds.includes(machine.id)
                              ? 'bg-smart-yellow/20 border-smart-yellow border'
                              : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedMachineIds.includes(machine.id)}
                            onChange={() => handleMachineToggle(machine.id)}
                            className="w-5 h-5 rounded border-gray-300 text-smart-yellow focus:ring-smart-yellow"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-smart-navy dark:text-white">{machine.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{machine.brand} {machine.model} - {machine.status}</p>
                          </div>
                          {machine.location && (
                            <MapPin size={14} className="text-gray-400" title={machine.location.address} />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Operatör Ata
                </label>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {operators.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">Henüz operatör eklenmemiş.</p>
                  ) : (
                    <div className="space-y-2">
                      {operators.map(operator => (
                        <label
                          key={operator.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            formData.assignedOperatorIds.includes(operator.id)
                              ? 'bg-blue-500/20 border-blue-500 border'
                              : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedOperatorIds.includes(operator.id)}
                            onChange={() => handleOperatorToggle(operator.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-smart-navy dark:text-white">{operator.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{operator.licenseType?.join(', ') || 'Lisans bilgisi yok'}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg font-bold bg-smart-navy dark:bg-smart-yellow text-white dark:text-smart-navy hover:bg-blue-900 dark:hover:bg-yellow-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      İş Ekle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {isDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <h3 className="text-2xl font-bold text-smart-navy dark:text-white">{selectedJob.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <MapPin size={14} /> {selectedJob.location}
                </p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Info */}
                <div className="space-y-6">
                  {/* Status Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Durum</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedJob.status)}`}>
                        {getStatusLabel(selectedJob.status)}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Öncelik</p>
                      <span className={`px-3 py-1 rounded text-sm font-bold ${getPriorityColor(selectedJob.priority || 'medium')}`}>
                        {getPriorityLabel(selectedJob.priority || 'medium')}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">İlerleme Durumu</p>
                      <span className="text-2xl font-bold text-smart-navy dark:text-white">{selectedJob.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedJob.status === 'Delayed' ? 'bg-red-500' :
                          selectedJob.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{width: `${selectedJob.progress}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Açıklama</p>
                      <p className="text-gray-700 dark:text-gray-300">{selectedJob.description}</p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-3">Tarihler</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Başlangıç:</span>
                        <span className="font-bold text-smart-navy dark:text-white">{selectedJob.startDate}</span>
                      </div>
                      {selectedJob.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bitiş:</span>
                          <span className="font-bold text-smart-navy dark:text-white">{selectedJob.endDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assigned Machines */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-3 flex items-center gap-2">
                      <Truck size={14} />
                      Atanan Makineler ({selectedJob.assignedMachineIds.length})
                    </p>
                    <div className="space-y-2">
                      {selectedJob.assignedMachineIds.map(mid => {
                        const machine = machines.find(m => m.id === mid);
                        const operator = operators.find(o => o.id === machine?.assignedOperatorId);
                        return machine ? (
                          <div key={mid} className="bg-white dark:bg-slate-600 rounded-lg p-3 border border-gray-200 dark:border-slate-500">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-smart-navy dark:text-white">{machine.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{machine.brand} {machine.model}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                machine.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                machine.status === 'Bakımda' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {machine.status}
                              </span>
                            </div>
                            {operator && (
                              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-500 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User size={14} />
                                <span>{operator.name}</span>
                              </div>
                            )}
                          </div>
                        ) : null;
                      })}
                      {selectedJob.assignedMachineIds.length === 0 && (
                        <p className="text-gray-400 italic text-sm">Henüz makine atanmadı.</p>
                      )}
                    </div>
                  </div>

                  {/* Assigned Operators */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-3 flex items-center gap-2">
                      <User size={14} />
                      Atanan Operatörler ({selectedJob.assignedOperatorIds?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {selectedJob.assignedOperatorIds?.map(oid => {
                        const operator = operators.find(o => o.id === oid);
                        return operator ? (
                          <div key={oid} className="bg-white dark:bg-slate-600 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <User size={18} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-bold text-smart-navy dark:text-white">{operator.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{operator.licenseType?.join(', ') || 'Lisans bilgisi yok'}</p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                      {(!selectedJob.assignedOperatorIds || selectedJob.assignedOperatorIds.length === 0) && (
                        <p className="text-gray-400 italic text-sm">Henüz operatör atanmadı.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Map */}
                <div className="space-y-4">
                  {selectedJob.coordinates ? (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden h-[400px]">
                      <MapContainer
                        center={[selectedJob.coordinates.lat, selectedJob.coordinates.lng]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedJob.coordinates.lat, selectedJob.coordinates.lng]} icon={jobIcon}>
                          <Popup>
                            <div>
                              <h4 className="font-bold">{selectedJob.title}</h4>
                              <p className="text-sm text-gray-500">{selectedJob.location}</p>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Show assigned machines on map */}
                        {selectedJob.assignedMachineIds.map(mid => {
                          const machine = machines.find(m => m.id === mid);
                          if (machine?.location) {
                            return (
                              <Marker
                                key={`detail-machine-${machine.id}`}
                                position={[machine.location.lat, machine.location.lng]}
                                icon={machine.status === 'Aktif' ? activeMachineIcon : machineIcon}
                              >
                                <Popup>
                                  <div>
                                    <h4 className="font-bold">{machine.name}</h4>
                                    <p className="text-sm text-gray-500">{machine.brand} {machine.model}</p>
                                    <p className="text-xs text-gray-400">{machine.location.address}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          }
                          return null;
                        })}
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-8 text-center h-[400px] flex flex-col items-center justify-center">
                      <Map size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Konum bilgisi mevcut değil</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Bu iş için koordinat eklenmemiş.</p>
                    </div>
                  )}

                  {/* Coordinates Info */}
                  {selectedJob.coordinates && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Koordinatlar</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          <Target size={14} className="inline mr-1" />
                          {selectedJob.coordinates.lat.toFixed(4)}, {selectedJob.coordinates.lng.toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${selectedJob.coordinates.lat},${selectedJob.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Navigation size={14} />
                          Google Maps'te Aç
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-between">
              <div className="flex gap-2">
                {updateJob && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openEditModal(selectedJob);
                    }}
                    className="px-4 py-2 rounded-lg font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Düzenle
                  </button>
                )}
                {deleteJob && (
                  <button
                    onClick={() => openDeleteConfirm(selectedJob)}
                    className="px-4 py-2 rounded-lg font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Sil
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-2xl font-bold text-smart-navy dark:text-white flex items-center gap-2">
                <Edit2 className="text-amber-500" />
                İşi Düzenle
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  İş Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="örn: Kuzey Otoyolu Viyadük İnşaatı"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                  rows={3}
                  placeholder="İş detaylarını girin..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Konum / Şantiye Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="örn: İstanbul, Levent Şantiyesi"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Enlem (Lat)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="41.0082"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Boylam (Lng)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="28.9784"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Job['status'] }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="Scheduled">Planlandı</option>
                    <option value="In Progress">Devam Ediyor</option>
                    <option value="Delayed">Gecikmede</option>
                    <option value="Completed">Tamamlandı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Job['priority'] }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-yellow focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  İlerleme: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Machine Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Makine Ata
                </label>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {machines.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">Henüz makine eklenmemiş.</p>
                  ) : (
                    <div className="space-y-2">
                      {machines.map(machine => (
                        <label
                          key={machine.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            formData.assignedMachineIds.includes(machine.id)
                              ? 'bg-smart-yellow/20 border-smart-yellow border'
                              : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedMachineIds.includes(machine.id)}
                            onChange={() => handleMachineToggle(machine.id)}
                            className="w-5 h-5 rounded border-gray-300 text-smart-yellow focus:ring-smart-yellow"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-smart-navy dark:text-white">{machine.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{machine.brand} {machine.model} - {machine.status}</p>
                          </div>
                          {machine.location && (
                            <MapPin size={14} className="text-gray-400" title={machine.location.address} />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Operatör Ata
                </label>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {operators.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">Henüz operatör eklenmemiş.</p>
                  ) : (
                    <div className="space-y-2">
                      {operators.map(operator => (
                        <label
                          key={operator.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            formData.assignedOperatorIds.includes(operator.id)
                              ? 'bg-blue-500/20 border-blue-500 border'
                              : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedOperatorIds.includes(operator.id)}
                            onChange={() => handleOperatorToggle(operator.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-smart-navy dark:text-white">{operator.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{operator.licenseType?.join(', ') || 'Lisans bilgisi yok'}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                  className="px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && jobToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-center text-smart-navy dark:text-white mb-2">
                İşi Silmek İstediğinize Emin Misiniz?
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-bold text-smart-navy dark:text-white">{jobToDelete.title}</span>
              </p>
              <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                Bu işlem geri alınamaz. İş ve tüm ilişkili veriler kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setJobToDelete(null); }}
                className="flex-1 px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
