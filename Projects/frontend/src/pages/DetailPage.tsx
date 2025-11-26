import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyCarousel } from '../components/PropertyCarousel';
import {
  propertiesApi,
  projectsApi,
  landsApi,
  agentContactApi,
  authApi,
  getErrorMessage,
} from '../api/client';

interface DetailListing {
  id: number;
  name: string;
  price?: number;
  price_range?: string;
  location_city: string;
  location_neighborhood: string;
  sq_ft_or_area?: number;
  details?: string;
  image_urls?: string[];
  type: 'property' | 'project' | 'land';
}

export const DetailPage: React.FC = () => {
  const { id, type } = useParams<{ id?: string; type?: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<DetailListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!id || !type) {
      setError('Missing ID or type');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        let res;
        if (type === 'property') {
          res = await propertiesApi.getOne(id);
        } else if (type === 'project') {
          res = await projectsApi.getOne(id);
        } else if (type === 'land') {
          res = await landsApi.getOne(id);
        } else {
          throw new Error('Invalid type');
        }
        setListing({ ...res.data, type: type as any });
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!contactName.trim()) {
      errors.name = 'Name is required';
    }
    if (!contactEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.email = 'Invalid email format';
    }
    if (!contactMessage.trim()) {
      errors.message = 'Message is required';
    } else if (contactMessage.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create temporary account with secure password
      const tempEmail = `contact_${Date.now()}@realestateapp.local`;
      const tempPassword = 'Secure' + Math.random().toString(36).substring(2, 12) + '123';

      try {
        await authApi.register(tempEmail, tempPassword);
      } catch (regError) {
        // User might already be registered, continue with login
      }

      try {
        await authApi.login(tempEmail, tempPassword);
      } catch (loginError) {
        // If login fails, store password as backup
        localStorage.setItem('backup_jwt_token', tempPassword);
      }

      // Submit contact request
      await agentContactApi.create({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        property_id: listing?.id || null,
      });

      setSubmitStatus({
        type: 'success',
        message: 'Contact request sent successfully! We will get back to you soon.',
      });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setFormErrors({});
    } catch (err: any) {
      setSubmitStatus({
        type: 'error',
        message: getErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-center text-lg text-gray-600">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center bg-red-50 p-6 rounded">
            <p className="text-red-600 font-semibold mb-4">Error Loading Property</p>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  if (!listing)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Property not found</p>
        </main>
        <Footer />
      </div>
    );
  if (error) return <p className="text-center py-12 text-red-600">{error}</p>;
  if (!listing) return <p className="text-center py-12">Not found</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Listings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Carousel */}
            <div>
              {listing.image_urls && listing.image_urls.length > 0 ? (
                <PropertyCarousel images={listing.image_urls} alt={listing.name} />
              ) : (
                <div className="w-full h-96 bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  No images available
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{listing.name}</h1>

              <div className="mb-4 text-gray-600">
                <p className="text-lg">
                  📍 {listing.location_neighborhood}, {listing.location_city}
                </p>
              </div>

              {listing.price && (
                <div className="mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    ${listing.price.toLocaleString()}
                  </span>
                </div>
              )}

              {listing.price_range && (
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">{listing.price_range}</span>
                </div>
              )}

              {listing.sq_ft_or_area && (
                <div className="mb-6 p-4 bg-gray-100 rounded">
                  <p className="text-lg">
                    <strong>Area:</strong> {listing.sq_ft_or_area.toLocaleString()} sq ft
                  </p>
                </div>
              )}

              {listing.details && (
                <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-600 rounded">
                  <h3 className="font-bold mb-2">Details</h3>
                  <p className="text-gray-700">{listing.details}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-12 max-w-2xl mx-auto bg-gray-50 p-8 rounded">
            <h2 className="text-2xl font-bold mb-6">Interested? Get in Touch</h2>
            <form onSubmit={handleContactSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value);
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    formErrors.name ? 'border-red-500 bg-red-50' : ''
                  }`}
                />
                {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    formErrors.email ? 'border-red-500 bg-red-50' : ''
                  }`}
                />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => {
                    setContactMessage(e.target.value);
                    setFormErrors((prev) => ({ ...prev, message: '' }));
                  }}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    formErrors.message ? 'border-red-500 bg-red-50' : ''
                  }`}
                />
                {formErrors.message && <p className="text-red-600 text-sm mt-1">{formErrors.message}</p>}
              </div>
              {submitStatus && (
                <div
                  className={`mb-4 p-3 rounded ${
                    submitStatus.type === 'error'
                      ? 'bg-red-100 border border-red-400 text-red-700'
                      : 'bg-green-100 border border-green-400 text-green-700'
                  }`}
                >
                  <p className="font-semibold">{submitStatus.type === 'error' ? '❌' : '✅'} {submitStatus.message}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Sending...' : 'Send Contact Request'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
