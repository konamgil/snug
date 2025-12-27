// Accommodation Server Actions (NestJS API 호출)
export {
  // Accommodation CRUD
  getAccommodations,
  getAccommodation,
  getAccommodationPublic,
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
