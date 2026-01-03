// Re-export all search feature components
export {
  // Core search components
  SearchForm,
  SearchModal,
  SearchTrigger,
  DatePicker,
  GuestPicker,
  formatGuestSummary,
  // Shared search components (used by views/search and views/map)
  MobileSearchBar,
  FilterModal,
  SearchMap,
  SearchMapSkeleton,
  RoomCard,
  RoomCardSkeleton,
  RoomCardSkeletonList,
  FilterBar,
  SortDropdown,
  RoomTypeDropdown,
  // Types
  type SearchParams,
  type GuestCount,
  type FilterState,
  type MarkerGroup,
  type Room,
  type SortOption,
  type RoomTypeOption,
} from './ui';
