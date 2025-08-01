'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

interface Villa {
  _id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  features: string[];
  amenities: string[];
}

export default function EditVillaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [villa, setVilla] = useState<Villa | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    swipeDeckImage: '', // Dedicated swipe deck image
    images: [''],
    features: [''],
    amenities: ['']
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchVilla();
  }, []);

  const fetchVilla = async () => {
    try {
      const response = await fetch(`/api/admin/villas/${params.id}`);
      if (response.ok) {
        const villaData = await response.json();
        setVilla(villaData);
        
        // Extract images and set swipe deck image
        const imageUrls = villaData.images?.length > 0 
          ? villaData.images.map((img: any) => typeof img === 'string' ? img : img.url || '').filter((url: string) => url.trim() !== '')
          : [];
        
        // Populate form data
        setFormData({
          name: villaData.name || '',
          description: villaData.description || '',
          price: villaData.price?.toString() || '',
          location: villaData.location || '',
          bedrooms: villaData.bedrooms?.toString() || '',
          bathrooms: villaData.bathrooms?.toString() || '',
          maxGuests: villaData.maxGuests?.toString() || '',
          swipeDeckImage: imageUrls[0] || '', // First image as swipe deck image
          images: imageUrls.slice(1).length > 0 ? imageUrls.slice(1) : [''], // Rest as additional images
          features: villaData.features?.length > 0 ? villaData.features : [''],
          amenities: villaData.amenities?.length > 0 ? villaData.amenities : ['']
        });
      } else {
        setError('Villa not found');
      }
    } catch (error) {
      setError('Failed to fetch villa');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'images' | 'features' | 'amenities', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'images' | 'features' | 'amenities') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'images' | 'features' | 'amenities', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (index: number, file: File | null) => {
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
      
      // Update form data with file name/preview
      handleArrayChange('images', index, file.name);
    }
  };

  const addImageFile = () => {
    setImageFiles(prev => [...prev, new File([], '')]);
    addArrayField('images');
  };

  const removeImageFile = (index: number) => {
    if (imageFiles.length > 1) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      removeArrayField('images', index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Clean up the form data
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        maxGuests: parseInt(formData.maxGuests),
        swipeDeckImage: formData.swipeDeckImage.trim(),
        images: formData.images.filter(img => img.trim() !== ''),
        features: formData.features.filter(feature => feature.trim() !== ''),
        amenities: formData.amenities.filter(amenity => amenity.trim() !== '')
      };

      // Combine swipe deck image with other images (swipe deck image first)
      const allImages = [cleanedData.swipeDeckImage, ...cleanedData.images].filter(img => img.trim() !== '');
      cleanedData.images = allImages;

      const response = await fetch(`/api/admin/villas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.ok) {
        router.push('/admin/cms/villas');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update villa');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading villa...</div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (error && !villa) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Link
                href="/admin/cms/villas"
                className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
              >
                Back to Villa Management
              </Link>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/cms/villas"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Villa Management
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Villa</h1>
            <p className="text-gray-600 mt-2">Update villa details and amenities</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Villa Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter villa name"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Guests *
                  </label>
                  <input
                    type="number"
                    id="maxGuests"
                    name="maxGuests"
                    required
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter max guests"
                  />
                </div>

                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    required
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    required
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Number of bathrooms"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter villa description"
                />
              </div>

              {/* Swipe Deck Image */}
              <div>
                <label htmlFor="swipeDeckImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Swipe Deck Image (Main Display Image) *
                </label>
                <input
                  type="url"
                  id="swipeDeckImage"
                  name="swipeDeckImage"
                  required
                  value={formData.swipeDeckImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter the main image URL that will appear in swipe deck"
                />
                <p className="text-sm text-gray-600 mt-1">
                  This will be the first image users see when browsing villas
                </p>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (URLs)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Add more images for the villa gallery (optional)
                </p>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleArrayChange('images', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Enter image URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('images', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('images')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Image
                </button>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('features', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('features')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Feature
                </button>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleArrayChange('amenities', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Enter amenity"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('amenities', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('amenities')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Amenity
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Link
                  href="/admin/cms/villas"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
