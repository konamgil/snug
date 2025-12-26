'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import {
  HeartIcon,
  HotelIcon,
  UserIcon,
  LocationIcon,
  AreaIcon,
  ElevatorIcon,
  ParkingIcon,
  RoomIcon,
  LivingRoomIcon,
  BathroomIcon,
  KitchenIcon,
  FloorIcon,
  BalconyIcon,
} from '@/shared/ui/icons';
import type { AccommodationFormData } from './types';
import {
  FACILITY_OPTIONS,
  AMENITY_OPTIONS,
  ACCOMMODATION_TYPE_OPTIONS,
  USAGE_TYPE_OPTIONS,
} from './types';

// Detail icons mapping
const detailIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  area: AreaIcon,
  elevator: ElevatorIcon,
  parking: ParkingIcon,
  room: RoomIcon,
  living: LivingRoomIcon,
  bathroom: BathroomIcon,
  kitchen: KitchenIcon,
  floor: FloorIcon,
  balcony: BalconyIcon,
};

interface AccommodationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AccommodationFormData;
}

export function AccommodationPreviewModal({
  isOpen,
  onClose,
  data,
}: AccommodationPreviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    guidelines: true,
    details: true,
    facilities: true,
    amenities: true,
    location: true,
    refundPolicy: false,
    longTermDiscount: false,
    notes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  const getMainPhoto = () => {
    const mainCategory = data.mainPhotos.find((c) => c.id === 'main');
    if (mainCategory && mainCategory.photos.length > 0) {
      return mainCategory.photos[0];
    }
    for (const category of data.mainPhotos) {
      if (category.photos.length > 0) return category.photos[0];
    }
    return null;
  };

  const mainPhoto = getMainPhoto();
  const allPhotos = data.mainPhotos.flatMap((cat) => cat.photos);
  const photoCount = allPhotos.length;

  const getTotalBeds = () => {
    const beds = data.space.beds;
    return beds.king + beds.queen + beds.single + beds.superSingle + beds.bunkBed;
  };

  const getUsageTypeBadges = () => {
    return data.usageTypes.map((type) => {
      const option = USAGE_TYPE_OPTIONS.find((o) => o.id === type);
      return option?.label || type;
    });
  };

  const getAccommodationTypeBadge = () => {
    const option = ACCOMMODATION_TYPE_OPTIONS.find((o) => o.id === data.accommodationType);
    return option?.label || data.accommodationType;
  };

  const getFacilityLabels = () => {
    return data.facilities.map((id) => {
      const option = FACILITY_OPTIONS.find((o) => o.id === id);
      return option?.label || id;
    });
  };

  const getAmenityLabels = () => {
    return data.amenities.map((id) => {
      const option = AMENITY_OPTIONS.find((o) => o.id === id);
      return option?.label || id;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal - 740px width as per Figma */}
      <div className="relative w-[740px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 text-[#161616]" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-5 py-10">
            {/* Hero Image Section */}
            <div className="relative w-[700px] h-[467px] mb-5 rounded-lg overflow-hidden bg-[#f4f4f4]">
              {mainPhoto ? (
                <Image src={mainPhoto.url} alt="Main photo" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#6f6f6f]">등록된 사진이 없습니다</p>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-5 left-5 flex gap-1">
                {getUsageTypeBadges().map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[10px] font-medium bg-[hsl(var(--snug-orange))] text-white rounded"
                  >
                    {badge}
                  </span>
                ))}
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#e0e0e0] text-[#161616] rounded">
                  {getAccommodationTypeBadge()}
                </span>
              </div>

              {/* Photo Count Badge */}
              {photoCount > 1 && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 rounded text-xs text-white">
                  1 / {photoCount}
                </div>
              )}
            </div>

            {/* Title Section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#161616]">
                  {data.address || 'Cheongdam-dong, Gangnam-gu'}
                </h2>
                <HeartIcon className="w-[18px] h-[18px] text-[#161616]" />
              </div>

              {/* Room Info */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#6f6f6f]">
                  <HotelIcon className="w-3.5 h-3.5" />
                  <span>{data.space.rooms.room} Rooms</span>
                  <span>·</span>
                  <span>{data.space.rooms.bathroom} Bathroom</span>
                  <span>·</span>
                  <span>{getTotalBeds()} Bed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6f6f6f]">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{data.space.capacity} Guests</span>
                </div>
              </div>
            </div>

            {/* Stay Description */}
            <Section
              title="Stay Description"
              expanded={expandedSections.description}
              onToggle={() => toggleSection('description')}
            >
              <p className="text-xs font-medium text-[#161616] mb-1">
                {data.roomName || 'Comfort & Convenience in Gangnam - Snug Stay'}
              </p>
              <p className="text-xs text-[#6f6f6f] leading-relaxed">
                {data.space.introduction ||
                  'Enjoy a peaceful stay in a cozy, sunlit room made for your comfort. Soft bedding and warm, thoughtful decor help you relax and recharge.'}
              </p>
            </Section>

            {/* Guidelines */}
            <Section
              title="Guidelines"
              expanded={expandedSections.guidelines}
              onToggle={() => toggleSection('guidelines')}
            >
              <p className="text-xs text-[#6f6f6f] leading-relaxed whitespace-pre-line">
                {data.space.houseRules ||
                  `Check-in: Self check-in (Password will be provided)
Check-out: By 12:30 PM
Cooking: Allowed — please clean up after use
Laundry: Long-term stays welcome`}
              </p>
            </Section>

            {/* Details */}
            <Section
              title="Details"
              expanded={expandedSections.details}
              onToggle={() => toggleSection('details')}
            >
              {/* Row 1 - Area, Elevator, Parking */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <DetailIconItem icon="area" label="Area" value={`${data.space.sizeM2 || 30}m²`} />
                <DetailIconItem icon="elevator" label="Elevator" value="Available" />
                <DetailIconItem icon="parking" label="Parking" value="Available" />
              </div>

              <div className="border-t border-[#e0e0e0] my-4" />

              {/* Row 2 - Rooms */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <DetailIconItem icon="room" label="Room" value={String(data.space.rooms.room)} />
                <DetailIconItem
                  icon="living"
                  label="Living room"
                  value={String(data.space.rooms.livingRoom)}
                />
                <DetailIconItem icon="bathroom" label="Bathroom" value={String(data.space.rooms.bathroom)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <DetailIconItem icon="kitchen" label="Kitchen" value={String(data.space.rooms.kitchen)} />
                <DetailIconItem icon="floor" label="2nd Floor" value="1" />
                <DetailIconItem icon="balcony" label="Balcony" value={String(data.space.rooms.terrace)} />
              </div>
            </Section>

            {/* Facilities */}
            <Section
              title="Facilities"
              expanded={expandedSections.facilities}
              onToggle={() => toggleSection('facilities')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {(getFacilityLabels().length > 0
                  ? getFacilityLabels()
                  : [
                      'Digital door lock',
                      'Refrigerator',
                      'Conditioner',
                      'Coffee maker',
                      'Washer',
                      'Hangers',
                      'TV',
                      'Wifi',
                    ]
                ).slice(0, 9).map((facility, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-[#161616]">
                    <span className="w-1.5 h-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full py-3 border border-[#e0e0e0] rounded-xl text-xs font-medium text-[#161616] hover:bg-[#f4f4f4] transition-colors"
              >
                Facilities More
              </button>
            </Section>

            {/* House Amenities */}
            <Section
              title="House Amenities"
              expanded={expandedSections.amenities}
              onToggle={() => toggleSection('amenities')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {(getAmenityLabels().length > 0
                  ? getAmenityLabels()
                  : ['Hair dryer', 'Shampoo', 'Conditioner', 'Body soap', 'Hot water']
                ).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-[#161616]">
                    <span className="w-1.5 h-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Location */}
            <Section
              title="Location"
              expanded={expandedSections.location}
              onToggle={() => toggleSection('location')}
            >
              <p className="text-xs text-[#161616] mb-3">
                {data.address || '123, Cheongdam-ro, Gangnam-gu, Seoul-si'}
              </p>

              {/* Location Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <LocationTab label="Subway Station" active />
                <LocationTab label="Bus Stop" />
                <LocationTab label="Convenience store" />
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-[250px] bg-[#f4f4f4] rounded-[20px] flex flex-col items-center justify-center gap-2 border border-[#e0e0e0]">
                <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                <span className="text-xs text-[#6f6f6f]">Map View</span>
              </div>
            </Section>

            {/* Other Stays You Might Love */}
            <Section
              title="Other Stays You May Like"
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-[180px] flex-shrink-0 cursor-pointer group">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                      <div className="w-full h-full bg-gradient-to-br from-[#f4f4f4] to-[#e0e0e0] flex items-center justify-center" />
                    </div>
                    <p className="text-xs font-semibold text-[#161616] mb-0.5 truncate">
                      Nonhyeon-dong, Gangnam-gu
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#6f6f6f] mb-0.5">
                      <HotelIcon className="w-3 h-3" />
                      <span>1 Rooms · 1 Bathroom · 2 Bed</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#6f6f6f] mb-1">
                      <UserIcon className="w-3 h-3" />
                      <span>2 Guests</span>
                    </div>
                    <p className="text-xs">
                      <span className="line-through text-[#a8a8a8] mr-1">$200</span>
                      <span className="font-bold text-[hsl(var(--snug-orange))]">$160</span>
                      <span className="text-[10px] text-[#6f6f6f]"> for 2 nights</span>
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Information */}
            <Section
              title="Information"
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-semibold text-[#161616]">
                    Included in Maintenance Fee
                  </h4>
                  <span className="text-xs text-[#6f6f6f]">
                    (Gas, Water, Internet, Electricity)
                  </span>
                </div>
                <p className="text-xs text-[#6f6f6f] leading-relaxed">
                  All utility charges and internet fees are included in the maintenance fee. If any of the included services are used excessively, additional charges may apply.
                </p>
              </div>
            </Section>

            {/* Refund Policy */}
            <Section
              title="Refund Policy"
              expanded={expandedSections.refundPolicy}
              onToggle={() => toggleSection('refundPolicy')}
            >
              <ul className="space-y-2">
                {[
                  'More than 15 days before check-in: 90% refund of rent and contract fee',
                  '14–8 days before check-in: 70% refund of rent and contract fee',
                  '7–1 days before check-in: 50% refund of rent and contract fee',
                  'On the check-in date: No refund',
                ].map((policy, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-[#6f6f6f]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Long-Term Stay Discount */}
            <Section
              title="Long-Term Stay Discount"
              expanded={expandedSections.longTermDiscount}
              onToggle={() => toggleSection('longTermDiscount')}
            >
              <ul className="space-y-2">
                {[
                  { period: 'Contract for 2+ weeks', discount: '5% off' },
                  { period: 'Contract for 4+ weeks', discount: '10% off' },
                  { period: 'Contract for 12+ weeks', discount: '20% off' },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-[#6f6f6f]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#6f6f6f] rounded-full flex-shrink-0" />
                    <span>
                      {item.period}: {item.discount}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Notes */}
            <Section
              title="Notes"
              expanded={expandedSections.notes}
              onToggle={() => toggleSection('notes')}
            >
              <ul className="space-y-2">
                {[
                  'For same-day cancellations, 10% of the rent and contract fee will be charged as a penalty according to the refund policy. However, if the cancellation falls within the free cancellation period, a full refund will be issued.',
                  'Maintenance fees, cleaning fees, and deposits are fully refundable.',
                  "The refund policy may vary depending on the host's terms.",
                ].map((note, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-[#6f6f6f]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#6f6f6f] rounded-full flex-shrink-0" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Component with expand/collapse
interface SectionProps {
  title: string;
  expanded?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
  children: React.ReactNode;
}

function Section({
  title,
  expanded = true,
  onToggle,
  showToggle = true,
  children,
}: SectionProps) {
  return (
    <div className="py-4 border-t border-[#e0e0e0] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
        disabled={!showToggle}
      >
        <h3 className="text-sm font-bold text-[#161616]">{title}</h3>
        {showToggle && (
          <ChevronDown
            className={`w-4 h-4 text-[#6f6f6f] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {expanded && children}
    </div>
  );
}

function DetailIconItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = detailIcons[icon] || RoomIcon;
  return (
    <div className="flex items-center gap-2 text-xs text-[#161616]">
      <Icon className="w-4 h-4 text-[#6f6f6f]" />
      <span>{label}</span>
      <span className="text-[#a8a8a8]">·</span>
      <span className="text-[#6f6f6f]">{value}</span>
    </div>
  );
}

function LocationTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 text-xs rounded transition-colors ${
        active
          ? 'bg-[hsl(var(--snug-orange))] text-white'
          : 'bg-[#f4f4f4] text-[#6f6f6f] hover:bg-[#e8e8e8]'
      }`}
    >
      {label}
    </button>
  );
}

