import { UUID } from 'crypto';

// Types based on database schema
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastEntryAt: Date | null;
  entryCount: number;
}

export interface Entry {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description: string | null;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingSystem {
  id: number;
  name: string;
  minValue: number;
  maxValue: number;
  stepValue: number;
  displayType: 'stars' | 'number' | 'emoji';
  tierLabels: string[];
}

export interface ListRatingSettings {
  listId: string;
  ratingSystemId: number;
  isRequired: boolean;
  displayPosition: number;
}

export interface CustomField {
  id: string;
  listId: string;
  fieldTypeId: number;
  name: string;
  options: any | null;
  isRequired: boolean;
  position: number;
}

export interface FieldValue {
  id: string;
  entryId: string;
  fieldId: string;
  valueText: string | null;
  valueNumber: number | null;
  valueDate: Date | null;
  valueBoolean: boolean | null;
  valueJson: any | null;
}

// Mock data
const currentUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatarUrl: null,
  isPremium: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const ratingSystem: RatingSystem = {
  id: 1,
  name: 'Five Stars',
  minValue: 1,
  maxValue: 5,
  stepValue: 0.5,
  displayType: 'stars',
  tierLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
};

const mockLists: List[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: currentUser.id,
    title: 'Favorite Restaurants',
    description: 'My go-to places for great food',
    isPublic: true,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-30'),
    lastEntryAt: new Date('2025-06-30'),
    entryCount: 3
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    userId: currentUser.id,
    title: 'Coffee Shops',
    description: 'Best places for coffee and work',
    isPublic: false,
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-06-28'),
    lastEntryAt: new Date('2025-06-28'),
    entryCount: 2
  }
];

const mockEntries: Entry[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    listId: mockLists[0].id,
    userId: currentUser.id,
    title: 'Sushi Place',
    description: 'Amazing fresh fish and great atmosphere',
    rating: 4.5,
    createdAt: new Date('2025-06-30'),
    updatedAt: new Date('2025-06-30')
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    listId: mockLists[0].id,
    userId: currentUser.id,
    title: 'Italian Restaurant',
    description: 'Authentic pasta and pizza',
    rating: 4.0,
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25')
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    listId: mockLists[0].id,
    userId: currentUser.id,
    title: 'Burger Joint',
    description: 'Best burgers in town',
    rating: 5.0,
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-20')
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174006',
    listId: mockLists[1].id,
    userId: currentUser.id,
    title: 'Artisan Coffee',
    description: 'Great pour-over and quiet atmosphere',
    rating: 4.5,
    createdAt: new Date('2025-06-28'),
    updatedAt: new Date('2025-06-28')
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174007',
    listId: mockLists[1].id,
    userId: currentUser.id,
    title: 'Coffee Chain',
    description: 'Reliable coffee and good wifi',
    rating: 3.5,
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25')
  }
];

const mockCustomFields: CustomField[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174008',
    listId: mockLists[0].id,
    fieldTypeId: 1, // Text
    name: 'Cuisine',
    options: null,
    isRequired: true,
    position: 0
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174009',
    listId: mockLists[0].id,
    fieldTypeId: 2, // Number
    name: 'Price Range',
    options: null,
    isRequired: true,
    position: 1
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174010',
    listId: mockLists[1].id,
    fieldTypeId: 5, // Select
    name: 'WiFi Quality',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
    isRequired: true,
    position: 0
  }
];

const mockFieldValues: FieldValue[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174011',
    entryId: mockEntries[0].id,
    fieldId: mockCustomFields[0].id,
    valueText: 'Japanese',
    valueNumber: null,
    valueDate: null,
    valueBoolean: null,
    valueJson: null
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174012',
    entryId: mockEntries[0].id,
    fieldId: mockCustomFields[1].id,
    valueText: null,
    valueNumber: 4,
    valueDate: null,
    valueBoolean: null,
    valueJson: null
  }
];

const mockListRatingSettings: ListRatingSettings[] = [
  {
    listId: mockLists[0].id,
    ratingSystemId: ratingSystem.id,
    isRequired: true,
    displayPosition: 0
  },
  {
    listId: mockLists[1].id,
    ratingSystemId: ratingSystem.id,
    isRequired: true,
    displayPosition: 0
  }
];

// Export mock data
export const mockData = {
  currentUser,
  ratingSystem,
  lists: mockLists,
  entries: mockEntries,
  customFields: mockCustomFields,
  fieldValues: mockFieldValues,
  listRatingSettings: mockListRatingSettings
};

// Helper functions to simulate database queries
export const getMockData = {
  // Lists
  getLists: () => mockData.lists.filter(list => list.userId === mockData.currentUser.id),
  getListById: (id: string) => mockData.lists.find(list => list.id === id),
  
  // Entries
  getEntriesByListId: (listId: string) => mockData.entries.filter(entry => entry.listId === listId),
  getEntryById: (id: string) => mockData.entries.find(entry => entry.id === id),
  
  // Custom Fields
  getCustomFieldsByListId: (listId: string) => mockData.customFields.filter(field => field.listId === listId),
  
  // Field Values
  getFieldValuesByEntryId: (entryId: string) => mockData.fieldValues.filter(value => value.entryId === entryId),
  
  // Rating Settings
  getListRatingSettings: (listId: string) => mockData.listRatingSettings.find(settings => settings.listId === listId),
  
  // Current User
  getCurrentUser: () => mockData.currentUser
};
