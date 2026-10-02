import { useState } from 'react';
import { Link } from 'react-router-dom';
import DonationStatusBadge from './DonationStatusBadge';

// Fallback placeholder shown when a donation image fails to load.
// Using React state avoids innerHTML manipulation — cleaner and eliminates any
// future risk of accidentally interpolating user data into a DOM write.
function ImagePlaceholder() {
  return (
    <div className="flex h-full items-center justify-center text-gray-300">
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
  );
}

function DonationCard({ donation }) {
  const { _id, itemType, category, images, location, status, medicine, medicalDevice } = donation;
  const [imageError, setImageError] = useState(false);

  const primaryImage = images?.find((img) => img.isPrimary) || images?.[0];
  const title = itemType === 'medicine' ? medicine?.name : medicalDevice?.deviceType;

  return (
    <Link
      to={`/donations/${_id}`}
      className="group card-hover flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-primary-500 animate-fade-in"
      aria-label={`عرض التبرع: ${title}`}
    >
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {title}
          </h3>
          <DonationStatusBadge status={status} />
        </div>

        {category && <p className="text-xs font-medium text-gray-500">{category.name}</p>}

        {location?.displayLabel && (
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5 shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {location.displayLabel}
          </p>
        )}

        {itemType === 'medicine' && medicine?.expiryDate && (
          <p className="text-xs text-gray-400">
            ينتهي: {new Date(medicine.expiryDate).toLocaleDateString('ar-EG')}
          </p>
        )}
      </div>
    </Link>
  );
}

export default DonationCard;
