import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ShieldCheck, Clock } from 'lucide-react';

export default function Landing() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?keyword=${keyword}&location=${location}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/50 -skew-y-3 transform origin-top-left -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4">Trusted Professionals at your door</span>
          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-gray-900 mb-6 leading-tight">
            Book <span className="text-primary">Local Experts</span> <br /> For Any Job
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl">
            Find vetted, reviewed, and reliable service providers near you. From plumbers to photographers, we connect you with the best.
          </p>
          
          <div className="glass-panel w-full max-w-4xl p-2 md:p-4 rounded-2xl relative z-20">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary transition shadow-sm outline-none text-gray-700" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-4 text-gray-400 font-bold">📍</div>
                <input 
                  type="text" 
                  placeholder="Where? (e.g. New York)" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary transition shadow-sm outline-none text-gray-700"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 whitespace-nowrap">
                Search Providers
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Book a professional in just three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">1. Discover</h3>
              <p className="text-gray-500">Search for the service you need and browse through verified local professionals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">2. Book a Slot</h3>
              <p className="text-gray-500">View real-time availability and request a booking instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-success rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">3. Get it Done</h3>
              <p className="text-gray-500">The provider completes the job. Confirm completion and leave a review.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
