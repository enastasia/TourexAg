import type { BookingTourParameterKey } from '../../../domain/booking/BookingRequest';

interface BookingTourParameterFieldConfig {
  label: string;
  placeholder: string;
  errorMessage: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export const TOUR_PARAMETER_FIELD_CONFIG: Record<
  BookingTourParameterKey,
  BookingTourParameterFieldConfig
> = {
  roomType: {
    label: 'Room Type',
    placeholder: 'Select room type',
    errorMessage: 'Select a room type before adding this tour to the cart.',
    options: [
      { value: 'double-room', label: 'Double Room' },
      { value: 'twin-room', label: 'Twin Room' },
      { value: 'family-suite', label: 'Family Suite' },
    ],
  },
  mealPlan: {
    label: 'Meal Plan',
    placeholder: 'Select meal plan',
    errorMessage: 'Select a meal plan before adding this tour to the cart.',
    options: [
      { value: 'breakfast', label: 'Breakfast Included' },
      { value: 'half-board', label: 'Half Board' },
      { value: 'all-inclusive', label: 'All Inclusive' },
    ],
  },
  seasonalRoute: {
    label: 'Seasonal Route',
    placeholder: 'Select seasonal route',
    errorMessage: 'Select a seasonal route before adding this tour to the cart.',
    options: [
      { value: 'spring-highlights', label: 'Spring Highlights Route' },
      { value: 'summer-coast', label: 'Summer Coast Route' },
      { value: 'winter-lights', label: 'Winter Lights Route' },
    ],
  },
  personalGuide: {
    label: 'Personal Guide',
    placeholder: 'Select personal guide',
    errorMessage: 'Select a personal guide before adding this tour to the cart.',
    options: [
      { value: 'local-expert', label: 'Local Expert Guide' },
      { value: 'history-guide', label: 'History & Culture Guide' },
      { value: 'concierge-guide', label: 'Private Concierge Guide' },
    ],
  },
  serviceLevel: {
    label: 'Service Level',
    placeholder: 'Select service level',
    errorMessage: 'Select a service level before adding this tour to the cart.',
    options: [
      { value: 'executive', label: 'Executive' },
      { value: 'first-class', label: 'First Class' },
      { value: 'vip', label: 'VIP' },
    ],
  },
};

export const getTourParameterOptionLabel = (
  field: BookingTourParameterKey,
  value: string,
): string =>
  TOUR_PARAMETER_FIELD_CONFIG[field].options.find((option) => option.value === value)
    ?.label ?? value;
