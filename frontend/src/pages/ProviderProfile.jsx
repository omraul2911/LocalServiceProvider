import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../hooks/useAuth';
import { Star, MapPin, CheckCircle, Calendar, Image as ImageIcon } from 'lucide-react';

export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const { data } = await api.get(`/providers/${id}`);
        setProvider(data);
        if (data.services?.length > 0) setSelectedService(data.services[0]);

        const { data: revs } = await api.get(`/reviews/provider/${data.userId._id}`);
        setReviews(revs);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchProvider();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedService || !selectedDate || !selectedSlot) {
      alert("Please select a service, date, and time slot.");
      return;
    }

    try {
      setBookingStatus('submitting');
      await api.post('/bookings', {
        providerId: provider.userId._id,
        serviceTitle: selectedService.title,
        price: selectedService.price,
        date: selectedDate,
        timeSlot: selectedSlot
      });
      setBookingStatus('success');
    } catch (err) {
      setBookingStatus('error');
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!provider) return <div className="text-center py-20">Provider not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="px-8 flex flex-col md:flex-row relative pb-8">
          <div className="-mt-16 w-32 h-32 bg-white rounded-2xl p-2 shadow-lg mb-4 md:mb-0 relative border border-gray-100 flex items-center justify-center font-bold text-4xl text-primary">
            {provider.userId.name.charAt(0)}
          </div>
          <div className="md:ml-6 mt-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
                  {provider.userId.name}
                  {provider.isVerified && <CheckCircle className="text-success w-6 h-6" />}
                </h1>
                <div className="flex items-center text-gray-500 mt-2 gap-4">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {provider.location || 'Location missing'}</span>
                  <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-orange-400 fill-current" /> {provider.stats.rating.toFixed(1)} ({provider.stats.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-700 max-w-2xl leading-relaxed">{provider.experience}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 object-cover">
            <h2 className="text-2xl font-heading font-bold mb-4">Services Offered</h2>
            <div className="space-y-4">
              {provider.services?.map((svc, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-xl p-4 cursor-pointer transition ${selectedService?.title === svc.title ? 'border-primary ring-1 ring-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{svc.title}</span>
                    <span className="text-primary">${svc.price}</span>
                  </div>
                  {svc.description && <p className="text-sm text-gray-600 mt-2">{svc.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Gallery */}
          {provider.portfolioImages?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {provider.portfolioImages.map((img, i) => (
                  <img key={i} src={img} alt="portfolio" className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 hover:opacity-90 transition cursor-pointer" />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-heading font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? <p className="text-gray-500">No reviews yet.</p> : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{rev.comment}"</p>
                    <p className="text-sm text-gray-500 mt-2">- {rev.customerId.name}</p>
                    {rev.images?.length > 0 && (
                       <div className="flex gap-2 mt-3">
                         {rev.images.map((img, i) => (
                           <img key={i} src={img} alt="review" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                         ))}
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Booking */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-heading font-bold mb-6">Book this Provider</h2>
            {bookingStatus === 'success' ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                <h3 className="font-bold text-lg mb-1">Booking Requested!</h3>
                <p className="text-sm">The provider has been notified.</p>
                <Link to="/dashboard" className="mt-4 block font-medium underline text-green-700 hover:text-green-900">Go to Dashboard</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Slot</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedSlot} onChange={e=>setSelectedSlot(e.target.value)}>
                    <option value="">Select a time</option>
                    {provider.availability?.map(day => day.slots.map(s => <option key={`${day.day}-${s}`} value={`${s} (${day.day})`}>{s} on {day.day}</option>))}
                    {/* Fallback if availability not structured in DB yet */}
                    {!provider.availability?.length && (
                      <><option value="09:00">09:00 AM</option><option value="11:00">11:00 AM</option><option value="14:00">02:00 PM</option></>
                    )}
                  </select>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{selectedService?.title || 'None selected'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedService?.price || '0.00'}</span>
                  </div>
                </div>
                <button 
                  onClick={handleBook}
                  disabled={bookingStatus === 'submitting'}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-4"
                >
                  {bookingStatus === 'submitting' ? 'Requesting...' : 'Request Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
