import { useState, useEffect } from 'react';
import { api, useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Short HTTP Polling for updates
  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      let imageUrls = [];
      if (reviewImages && reviewImages.length > 0) {
        const formData = new FormData();
        Array.from(reviewImages).forEach((img) => formData.append('images', img));
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrls = res.data.urls;
      }

      await api.post('/reviews', {
        bookingId: reviewingBooking._id,
        providerId: user.role === 'customer' ? reviewingBooking.providerId._id : reviewingBooking.customerId._id,
        rating,
        comment,
        images: imageUrls
      });
      alert('Review submitted!');
      setReviewingBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    }
    setSubmittingReview(false);
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold">Hello, {user?.name} ({user?.role})</h1>
        <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-xl font-bold transition flex items-center gap-2">
          Logout
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading">Your Bookings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings yet.</div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-lg">{booking.serviceTitle}</h3>
                  <p className="text-sm text-gray-600">
                    With: <span className="font-medium">{user.role === 'customer' ? booking.providerId.name : booking.customerId.name}</span>
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

                  {/* Customer Actions */}
                  {user.role === 'customer' && booking.status === 'Completion Requested' && (
                    <button onClick={() => updateStatus(booking._id, 'Completed')} className="px-3 py-1 bg-success text-white rounded hover:bg-green-700 text-sm font-bold shadow-md shadow-green-500/20">Confirm Completion</button>
                  )}
                  
                  {/* Reviews for Customer */}
                  {user.role === 'customer' && booking.status === 'Completed' && (
                    <button onClick={() => setReviewingBooking(booking)} className="text-primary hover:underline text-sm font-medium">Leave a Review</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold font-heading mb-4">Review {reviewingBooking.serviceTitle}</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)} className="w-full border p-2 rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full border p-2 rounded-lg" rows="3"></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images (Max 5)</label>
                <input type="file" multiple accept="image/*" onChange={e=>setReviewImages(e.target.files)} className="w-full text-sm" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setReviewingBooking(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold shadow-lg shadow-blue-500/30">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
