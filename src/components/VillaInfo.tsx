'use client';

import { Villa } from '@/types/villa';
import { formatPrice } from '@/utils/helpers';

interface VillaInfoProps {
  villa: Villa;
}

export default function VillaInfo({ villa }: VillaInfoProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {villa.name}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{villa.location}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {formatPrice(villa.price)} <span className="text-lg font-normal">/ night</span>
        </p>
      </div>

      {/* Villa details */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{villa.bedrooms}</p>
          <p className="text-sm text-gray-600">Bedrooms</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{villa.bathrooms}</p>
          <p className="text-sm text-gray-600">Bathrooms</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{villa.maxGuests}</p>
          <p className="text-sm text-gray-600">Guests</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{villa.description}</p>
      </div>

      {/* Features */}
      {villa.features.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {villa.features.map((feature, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {villa.amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
          <div className="grid grid-cols-2 gap-2">
            {villa.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
