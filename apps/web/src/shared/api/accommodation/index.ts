// Accommodation Server Actions (NestJS API 호출)
export {
  // Accommodation CRUD
  getAccommodations,
  getAccommodation,
  getAccommodationPublic,
  getAccommodationPrice,
  getPublicAccommodations,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  // Accommodation Group CRUD
  getAccommodationGroups,
  createAccommodationGroup,
  updateAccommodationGroup,
  deleteAccommodationGroup,
  // Similar Accommodations
  getSimilarAccommodations,
} from './actions';

// Query Keys (can be used in both server and client components)
export { accommodationKeys } from './keys';

// React Query Hooks (client only)
export {
  useAccommodationPublic,
  useAccommodationPrice,
  useSimilarAccommodations,
  usePublicAccommodations,
} from './hooks';
