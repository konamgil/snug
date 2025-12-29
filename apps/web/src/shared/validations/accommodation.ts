import { z } from 'zod';

// Accommodation Types
const accommodationTypeEnum = z.enum(['house', 'share_room', 'share_house', 'apartment']);
const usageTypeEnum = z.enum(['stay', 'short_term']);
const genderRuleEnum = z.enum(['male_only', 'female_only', 'pet_allowed']);
const buildingTypeEnum = z.enum(['apartment', 'villa', 'house', 'officetel']);

// Photo Schema
const photoItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  order: z.number(),
});

const photoCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  photos: z.array(photoItemSchema),
  order: z.number(),
});

// Pricing Schema
const pricingSchema = z.object({
  basePrice: z.number().min(0),
  includesUtilities: z.boolean(),
  weekendPrice: z.number().optional(),
  weekendDays: z.array(z.string()),
  managementFee: z.number().optional(),
  cleaningFee: z.number().optional(),
  extraPersonFee: z.number().optional(),
  petFee: z.number().optional(),
  additionalFees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number(),
    }),
  ),
});

// Space Schema
const spaceSchema = z.object({
  capacity: z.number().min(1),
  genderRules: z.array(genderRuleEnum),
  sizeM2: z.number().optional(),
  sizePyeong: z.number().optional(),
  rooms: z.object({
    room: z.number(),
    livingRoom: z.number(),
    kitchen: z.number(),
    bathroom: z.number(),
    terrace: z.number(),
  }),
  beds: z.object({
    king: z.number(),
    queen: z.number(),
    single: z.number(),
    superSingle: z.number(),
    bunkBed: z.number(),
  }),
  houseRules: z.string().optional(),
  introduction: z.string().optional(),
});

// Manager Schema
const managerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  additionalInfo: z.string().optional(),
});

/**
 * BLOCKING Validation Schema
 * These validations MUST pass to save the accommodation (DRAFT status)
 */
export const accommodationBlockingSchema = z.object({
  roomName: z.string().min(1).max(100),
  address: z.string().min(1),
  accommodationType: accommodationTypeEnum,
  usageTypes: z.array(usageTypeEnum).min(1),
  pricing: z.object({
    basePrice: z.number().min(0),
  }),
  space: z.object({
    capacity: z.number().min(1),
  }),
});

/**
 * Full Form Schema (for type safety)
 */
export const accommodationFormSchema = z.object({
  // Basic Info
  mainPhotos: z.array(photoCategorySchema),
  address: z.string(),
  addressDetail: z.string(),
  zipCode: z.string(),
  roadAddress: z.string().optional(),
  sido: z.string().optional(),
  sigungu: z.string().optional(),
  bname: z.string().optional(),
  buildingName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  usageTypes: z.array(usageTypeEnum),
  minReservationDays: z.number(),
  groupName: z.string().optional(),
  accommodationType: accommodationTypeEnum,
  roomName: z.string(),
  buildingType: buildingTypeEnum.optional(),

  // Pricing
  pricing: pricingSchema,

  // Space
  space: spaceSchema,

  // Facilities & Amenities
  facilities: z.array(z.string()),
  amenities: z.array(z.string()),

  // Manager
  managers: z.array(managerSchema),

  // Meta
  isOperating: z.boolean(),
  openDate: z.string().optional(),
  lastModifiedBy: z.string().optional(),
  lastModifiedAt: z.string().optional(),
});

/**
 * PUBLISH GATE Validation Schema
 * These validations MUST pass to change status to ACTIVE
 */
export const accommodationPublishGateSchema = z.object({
  // Must have at least 1 photo
  mainPhotos: z
    .array(photoCategorySchema)
    .refine((categories) => categories.some((cat) => cat.photos.length > 0), {
      message: 'publishGate.photosRequired',
    }),

  // Introduction must be at least 50 characters
  space: z.object({
    introduction: z.string().min(50, { message: 'publishGate.introductionRequired' }),
  }),

  // Base price must be greater than 0
  pricing: z.object({
    basePrice: z.number().min(1, { message: 'publishGate.basePriceRequired' }),
  }),
});

/**
 * Validation Error Messages (i18n keys)
 */
export const validationMessages = {
  roomName: {
    required: 'validation.roomNameRequired',
    maxLength: 'validation.roomNameMaxLength',
  },
  address: {
    required: 'validation.addressRequired',
  },
  accommodationType: {
    required: 'validation.accommodationTypeRequired',
  },
  usageTypes: {
    required: 'validation.usageTypesRequired',
  },
  basePrice: {
    required: 'validation.basePriceRequired',
    min: 'validation.basePriceMin',
  },
  capacity: {
    required: 'validation.capacityRequired',
    min: 'validation.capacityMin',
  },
  publishGate: {
    photosRequired: 'validation.publishGate.photosRequired',
    introductionRequired: 'validation.publishGate.introductionRequired',
    basePriceRequired: 'validation.publishGate.basePriceRequired',
  },
};

/**
 * Type exports
 */
export type AccommodationBlockingInput = z.infer<typeof accommodationBlockingSchema>;
export type AccommodationFormInput = z.infer<typeof accommodationFormSchema>;
export type AccommodationPublishGateInput = z.infer<typeof accommodationPublishGateSchema>;

/**
 * Helper function to validate blocking rules
 */
export function validateBlocking(data: unknown) {
  return accommodationBlockingSchema.safeParse(data);
}

/**
 * Helper function to validate publish gate rules
 */
export function validatePublishGate(data: unknown) {
  return accommodationPublishGateSchema.safeParse(data);
}

/**
 * Helper function to check if accommodation can be published (ACTIVE)
 */
export function canPublish(data: {
  mainPhotos: { photos: unknown[] }[];
  space: { introduction?: string };
  pricing: { basePrice: number };
}): { canPublish: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check photos
  const hasPhotos = data.mainPhotos.some((cat) => cat.photos.length > 0);
  if (!hasPhotos) {
    errors.push('publishGate.photosRequired');
  }

  // Check introduction
  const introLength = data.space.introduction?.length || 0;
  if (introLength < 50) {
    errors.push('publishGate.introductionRequired');
  }

  // Check base price
  if (data.pricing.basePrice <= 0) {
    errors.push('publishGate.basePriceRequired');
  }

  return {
    canPublish: errors.length === 0,
    errors,
  };
}
