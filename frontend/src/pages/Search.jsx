import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../hooks/useAuth';
import { Star, MapPin } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const keywordParam = searchParams.get('keyword') || '';
  const locationParam = searchParams.get('location') || '';

  const [keyword, setKeyword] = useState(keywordParam);
  const [location, setLocation] = useState(locationParam);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/providers?keyword=${keywordParam}&location=${locationParam}`);
        setProviders(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchProviders();
  }, [keywordParam, locationParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, location });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
          <h2 className="font-heading font-bold text-lg mb-4">Filters</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Plumbing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <h1 className="text-3xl font-heading font-bold mb-6">Search Results</h1>
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        ) : providers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">No professionals found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <div key={provider._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="h-32 bg-gray-200 relative">
                   {provider.portfolioImages && provider.portfolioImages.length > 0 ? (
                     <img src={provider.portfolioImages[0]} alt="cover" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-r from-blue-100 to-teal-100 flex items-center justify-center">
                       <span className="text-gray-400 font-bold text-xl">{provider.userId.name}'s Service</span>
                     </div>
                   )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-bold text-xl">{provider.userId.name}</h3>
                    <div className="flex items-center text-orange-400 bg-orange-50 px-2 py-1 rounded-md">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm font-bold text-orange-700">{provider.stats.rating > 0 ? provider.stats.rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" /> {provider.location || 'Remote'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 line-clamp-2 mb-4">{provider.experience}</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.services?.slice(0, 3).map((s, i) => (
                        <span key={i} className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="font-bold text-gray-900">{provider.stats.jobsCompleted}</span> jobs done
                    </div>
                    <Link to={`/provider/${provider._id}`} className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
