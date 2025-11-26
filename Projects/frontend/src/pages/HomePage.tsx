import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ListingCard, Listing } from '../components/ListingCard';
import { listingsApi, getErrorMessage } from '../api/client';

export const HomePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listingsApi.popular(6);
        setListings(res.data);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await listingsApi.search(searchQuery, searchLocation, 20);
      setListings(res.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchLocation('');
    setHasSearched(false);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listingsApi.popular(6);
        setListings(res.data);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  };

  const properties = listings.filter((l) => l.type === 'property');
  const projects = listings.filter((l) => l.type === 'project');
  const lands = listings.filter((l) => l.type === 'land');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Property</h1>
            <p className="text-xl mb-6">Discover thousands of properties, projects, and lands</p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Location (city/neighborhood)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-4 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors"
              >
                Search
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading && <p className="text-center text-lg text-gray-600">Loading...</p>}
          {error && (
            <div className="max-w-md mx-auto text-center bg-red-50 p-6 rounded mb-8">
              <p className="text-red-600 font-semibold mb-4">Error</p>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Back to Popular
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Search Results or Popular Listings */}
              {listings.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8">
                    {hasSearched ? (
                      <>
                        Search Results
                        <span className="text-lg text-gray-600 font-normal ml-2">
                          ({listings.length} result{listings.length !== 1 ? 's' : ''})
                        </span>
                      </>
                    ) : (
                      'Popular Listings'
                    )}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <ListingCard key={`${listing.type}-${listing.id}`} listing={listing} />
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {!hasSearched && listings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No listings available at the moment.</p>
                </div>
              )}

              {hasSearched && listings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-6">No properties found matching your search.</p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Popular Listings
                  </button>
                </div>
              )}

              {/* Properties - only show if not searching */}
              {!hasSearched && properties.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.slice(0, 3).map((listing) => (
                      <ListingCard key={`property-${listing.id}`} listing={listing} />
                    ))}
                  </div>
                </div>
              )}

              {/* Projects - only show if not searching */}
              {!hasSearched && projects.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.slice(0, 3).map((listing) => (
                      <ListingCard key={`project-${listing.id}`} listing={listing} />
                    ))}
                  </div>
                </div>
              )}

              {/* Lands - only show if not searching */}
              {!hasSearched && lands.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8">Available Lands</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lands.slice(0, 3).map((listing) => (
                      <ListingCard key={`land-${listing.id}`} listing={listing} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
