import { useState, useEffect } from 'react';
import { api, useAuth } from '../hooks/useAuth';
import { User, Briefcase, Calendar, Folder, List } from 'lucide-react';

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Profile state
  const [profile, setProfile] = useState({
    experience: '',
    location: '',
    services: [],
    availability: [],
    portfolioImages: []
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [newImages, setNewImages] = useState(null);
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/providers/profile/me');
      if (data && data._id) {
        setProfile({
          experience: data.experience || '',
          location: data.location || '',
          services: data.services || [],
          availability: data.availability || [],
          portfolioImages: data.portfolioImages || []
        });
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingProfile(false);
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
    setLoadingBookings(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); // short polling
    return () => clearInterval(interval);
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleProfileSave = async (e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      let imageUrls = [...profile.portfolioImages];
      if (newImages && newImages.length > 0) {
        const formData = new FormData();
        Array.from(newImages).forEach((img) => formData.append('images', img));
        const res = await api.post('/upload', formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrls = [...imageUrls, ...res.data.urls];
      }
      
      const { data } = await api.put('/providers/profile', {
        ...profile,
        portfolioImages: imageUrls
      });
      setProfile({
          ...profile,
          portfolioImages: data.portfolioImages || [],
          services: data.services || [],
          availability: data.availability || [],
          experience: data.experience || '',
          location: data.location || ''
      });
      setNewImages(null);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
    setSavingProfile(false);
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...profile.services];
    newServices[index][field] = value;
    setProfile({ ...profile, services: newServices });
  };

  const addService = () => {
    setProfile({ ...profile, services: [...profile.services, { title: '', description: '', price: 0 }] });
  };

  const removeService = (index) => {
    const newServices = [...profile.services];
    newServices.splice(index, 1);
    setProfile({ ...profile, services: newServices });
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvail = [...profile.availability];
    if (field === 'slots') {
      newAvail[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      newAvail[index][field] = value;
    }
    setProfile({ ...profile, availability: newAvail });
  };

  const addAvailabilityDay = () => {
    setProfile({ ...profile, availability: [...profile.availability, { day: 'Monday', slots: [] }] });
  };

  const removeAvailabilityDay = (index) => {
    const newAvail = [...profile.availability];
    newAvail.splice(index, 1);
    setProfile({ ...profile, availability: newAvail });
  };

  const tabs = [
    { id: 'bookings', name: 'Bookings', icon: <List className="w-5 h-5" /> },
    { id: 'profile', name: 'Profile Basics', icon: <User className="w-5 h-5" /> },
    { id: 'services', name: 'Services', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'availability', name: 'Availability', icon: <Calendar className="w-5 h-5" /> },
    { id: 'portfolio', name: 'Portfolio', icon: <Folder className="w-5 h-5" /> },
  ];

  if (loadingProfile || loadingBookings) return <div className="text-center py-20">Loading Provider Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24 self-start">
        <h2 className="font-heading font-bold text-lg mb-4 px-2">Provider Menu</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-medium transition ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-bold text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold font-heading mb-6">Incoming Bookings</h2>
            <div className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No bookings yet.</div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking._id} className="py-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-bold text-lg">{booking.serviceTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: <span className="font-medium">{booking.customerId?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Date: {booking.date} | Slot: {booking.timeSlot} | Price: ${booking.price}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border
                        ${booking.status === 'Requested' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                        ${booking.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${booking.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}>
                        {booking.status}
                      </span>
                      {booking.status === 'Requested' && (
                        <div className="flex gap-2">
                           <button onClick={() => updateBookingStatus(booking._id, 'Accepted')} className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-700 text-sm">Accept</button>
                           <button onClick={() => updateBookingStatus(booking._id, 'Rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">Reject</button>
                        </div>
                      )}
                      {booking.status === 'Accepted' && (
                        <button onClick={() => updateBookingStatus(booking._id, 'In Progress')} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">Start Job</button>
                      )}
                      {booking.status === 'In Progress' && (
                        <button onClick={() => updateBookingStatus(booking._id, 'Completion Requested')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Request Completion</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Basics Tab */}
        {activeTab === 'profile' && (
          <div>
             <h2 className="text-2xl font-bold font-heading mb-6">Profile Basics</h2>
             <form onSubmit={handleProfileSave} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                  <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" placeholder="City, State" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Short Description)</label>
                  <textarea value={profile.experience} onChange={(e) => setProfile({...profile, experience: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" rows="4" placeholder="Tell us about your background..."></textarea>
               </div>
               <button type="submit" disabled={savingProfile} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
               </button>
             </form>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold font-heading">Your Services</h2>
               <button onClick={addService} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition">
                 + Add Service
               </button>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-6">
              {profile.services.map((service, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl relative bg-gray-50">
                  <button type="button" onClick={() => removeService(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-16">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                       <input type="text" required value={service.title} onChange={(e) => handleServiceChange(index, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Plumbing Pipe fixing" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                       <input type="number" required value={service.price} onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" placeholder="50" min="0" />
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={service.description} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows="2" placeholder="Describe the service..."></textarea>
                  </div>
                </div>
              ))}
              {profile.services.length === 0 && <p className="text-gray-500 italic">No services added yet.</p>}
              <button type="submit" disabled={savingProfile} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  {savingProfile ? 'Saving...' : 'Save Services'}
               </button>
            </form>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold font-heading">Manage Availability</h2>
               <button onClick={addAvailabilityDay} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition">
                 + Add Day
               </button>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-6">
              {profile.availability.map((avail, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl relative bg-gray-50 flex flex-col md:flex-row gap-4">
                  <button type="button" onClick={() => removeAvailabilityDay(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                  <div className="w-full md:w-1/3 pr-12">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                     <select value={avail.day} onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                     </select>
                  </div>
                  <div className="w-full md:w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots (Comma separated)</label>
                    <input type="text" value={(avail.slots || []).join(', ')} onChange={(e) => handleAvailabilityChange(index, 'slots', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 10:00 AM, 02:00 PM" />
                  </div>
                </div>
              ))}
              {profile.availability.length === 0 && <p className="text-gray-500 italic">No availability added yet.</p>}
              <button type="submit" disabled={savingProfile} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  {savingProfile ? 'Saving...' : 'Save Availability'}
               </button>
            </form>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <h2 className="text-2xl font-bold font-heading mb-6">Portfolio Images</h2>
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.portfolioImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border">
                  <img src={img} alt="Portfolio" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={() => {
                        const newImages = [...profile.portfolioImages];
                        newImages.splice(idx, 1);
                        setProfile({...profile, portfolioImages: newImages});
                    }} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
                  </div>
                </div>
              ))}
              {profile.portfolioImages.length === 0 && <div className="col-span-full py-8 text-center bg-gray-50 border rounded-lg text-gray-500">No images uploaded.</div>}
            </div>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setNewImages(e.target.files)} className="w-full px-3 py-2 border rounded-lg" />
               </div>
               <button type="submit" disabled={savingProfile} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  {savingProfile ? 'Uploading...' : 'Upload & Save'}
               </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
