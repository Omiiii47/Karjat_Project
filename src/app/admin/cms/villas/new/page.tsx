'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

export default function AddNewVillaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (jpg, png, webp, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        if (type === 'swipeDeck') {
          setFormData(prev => ({ ...prev, swipeDeckImage: result.url }));
        } else {
          // For additional images
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result.url]
          }));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
    }
  };

  const handleMultipleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'additional');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result.url]
          }));
        } else {
          const errorData = await response.json();
          setError(`Failed to upload ${file.name}: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setError(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleAdditionalImageUpload = (index: number, file: File | null) => {
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
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
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
        [field]: prev[field].filter((_: string, i: number) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Villa name is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!formData.location.trim()) {
        setError('Location is required');
        return;
      }
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        setError('Valid price is required');
        return;
      }
      if (!formData.bedrooms || isNaN(parseInt(formData.bedrooms))) {
        setError('Valid number of bedrooms is required');
        return;
      }
      if (!formData.bathrooms || isNaN(parseInt(formData.bathrooms))) {
        setError('Valid number of bathrooms is required');
        return;
      }
      if (!formData.maxGuests || isNaN(parseInt(formData.maxGuests))) {
        setError('Valid maximum guests number is required');
        return;
      }
      if (!formData.swipeDeckImage.trim()) {
        setError('Swipe deck image is required');
        return;
      }

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

      console.log('Submitting villa data:', cleanedData);

      // For now, we'll submit as JSON (file upload can be implemented later)
      const response = await fetch('/api/admin/villas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        router.push('/admin/cms');
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        console.log('Error status:', response.status);
        setError(errorData.error || errorData.message || 'Failed to create villa');
      }
    } catch (error) {
      console.error('Network/fetch error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/cms"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Villa</h1>
            <p className="text-gray-600 mt-2">Create a new villa listing with all details and amenities</p>
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
                <label htmlFor="swipeDeckImageFile" className="block text-sm font-medium text-gray-700 mb-2">
                  Swipe Deck Image (Main Display Image) *
                </label>
                <input
                  type="file"
                  id="swipeDeckImageFile"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'swipeDeck')}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.swipeDeckImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.swipeDeckImage} 
                      alt="Swipe deck preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, swipeDeckImage: '' }))}
                      className="text-red-500 text-sm mt-1 block hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Upload the main image that will appear in swipe deck (JPG, PNG, WebP - max 5MB)
                </p>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (Upload Files)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Add more images for the villa gallery (optional) - JPG, PNG, WebP - max 5MB each
                </p>
                
                {/* File upload for additional images */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleMultipleFileUpload(e.target.files);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>

                {/* Preview uploaded images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Villa image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField('images', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  href="/admin/cms"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Villa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
