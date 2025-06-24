# RatePal Database Schema Explanation

This document provides a comprehensive explanation of the RatePal database schema, detailing how each table functions individually and how they work together to create a cohesive rating app experience.

## Overview

RatePal's database is designed with a flexible, normalized structure that enables:
- User-created lists of items to rate
- Custom fields per list type
- Flexible rating systems
- Voice memo attachments (optional)
- Future extensibility

## Tables and Their Relationships

### 1. Users Table

**Purpose:** Stores user account information and authentication details.

```dbml
Table users {
  id uuid [pk, default: `uuid_generate_v4()`]
  email text [unique, not null]
  password_hash text [not null]
  name text
  avatar_url text
  is_premium boolean [default: false]
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
}
```

**Key Features:**
- UUID primary keys for security and scalability
- Basic profile information (name, avatar)
- Premium status flag for feature access control
- Timestamps for account lifecycle management

**Example User:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "jane@example.com",
  "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "name": "Jane Smith",
  "avatar_url": "https://storage.example.com/avatars/jane.jpg",
  "is_premium": true,
  "created_at": "2025-01-15T14:30:00Z",
  "updated_at": "2025-06-01T09:15:00Z"
}
```

**Interaction Pattern:**
- Central to all user-specific data
- Powers authentication flow and premium feature access
- Starting point for querying user's lists and ratings

### 2. Lists Table

**Purpose:** Represents collections of items to be rated, created by users.

```dbml
Table lists {
  id uuid [pk, default: `uuid_generate_v4()`]
  user_id uuid [ref: > users.id, not null]
  title text [not null]
  description text
  is_public boolean [default: false]
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
  last_entry_at timestamptz
  entry_count integer [default: 0]
}
```

**Key Features:**
- Associated with a specific user via `user_id`
- Privacy control via `is_public` flag
- Metadata like entry count and last entry timestamp
- Lists can be anything: movies, restaurants, books, games, etc.

**Example List:**
```json
{
  "id": "723a4127-e89b-92e3-b456-426614174088",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "My Favorite Restaurants",
  "description": "Places I've dined at with personal ratings and notes",
  "is_public": true,
  "created_at": "2025-02-10T18:20:00Z",
  "updated_at": "2025-06-15T12:45:00Z",
  "last_entry_at": "2025-06-15T12:45:00Z",
  "entry_count": 24
}
```

**Interaction Pattern:**
- Users typically create multiple lists for different categories
- Lists serve as containers for both entries and custom field definitions
- Can be public (shareable) or private

### 3. Field Types Table

**Purpose:** Reference table defining the available types of custom fields.

```dbml
Table field_types {
  id serial [pk]
  name text [not null]
  description text
}
```

**Key Features:**
- Simple lookup table with integer primary keys
- Predefined set of field types (not user-created)

**Standard Field Types:**
```
1. Text - Free text input
2. Number - Numeric values
3. Date - Calendar date/time
4. Boolean - Yes/No toggle
5. Select - Single choice from options
6. MultiSelect - Multiple choices from options
```

**Interaction Pattern:**
- Referenced when users create custom fields
- Determines UI input type and validation rules
- Static, application-managed data

### 4. Custom Fields Table

**Purpose:** Defines user-created fields for lists, enabling customizable data collection.

```dbml
Table custom_fields {
  id uuid [pk, default: `uuid_generate_v4()`]
  list_id uuid [ref: > lists.id, not null]
  field_type_id integer [ref: > field_types.id, not null]
  name text [not null]
  options jsonb
  is_required boolean [default: false]
  position integer [default: 0]
}
```

**Key Features:**
- Associated with a specific list
- Uses field_type_id to determine input type
- Flexible options via JSONB for field configuration
- Position for display order in UI
- Flag for required fields

**Example Custom Fields:**
```json
[
  {
    "id": "a23e4567-e89b-12d3-a456-426614174111",
    "list_id": "723a4127-e89b-92e3-b456-426614174088",
    "field_type_id": 1,
    "name": "Service Notes",
    "options": null,
    "is_required": false,
    "position": 1
  },
  {
    "id": "b34e4567-e89b-12d3-a456-426614174222",
    "list_id": "723a4127-e89b-92e3-b456-426614174088",
    "field_type_id": 5,
    "name": "Cuisine Type",
    "options": {
      "choices": ["Italian", "Japanese", "Mexican", "Indian", "American", "Other"],
      "default": "Other"
    },
    "is_required": true,
    "position": 0
  },
  {
    "id": "c45e4567-e89b-12d3-a456-426614174333",
    "list_id": "723a4127-e89b-92e3-b456-426614174088",
    "field_type_id": 3,
    "name": "Visit Date",
    "options": {
      "includeTime": false
    },
    "is_required": true,
    "position": 2
  }
]
```

**Interaction Pattern:**
- Users define custom fields when creating or editing a list
- These fields become form elements when creating entries
- Different lists can have entirely different field sets

### 5. Rating Systems Table

**Purpose:** Defines different rating scales and their display formats.

```dbml
Table rating_systems {
  id serial [pk]
  name text [not null]
  min_value numeric [not null]
  max_value numeric [not null]
  step_value numeric [default: 1]
  display_type text [not null]
  tier_labels text[]
}
```

**Key Features:**
- Predefined rating scales (not user-created)
- Configurable numeric ranges with step values
- Visual display type (stars, numbers, emojis)
- Optional labels for rating tiers

**Example Rating Systems:**
```json
[
  {
    "id": 1,
    "name": "Five Stars",
    "min_value": 1,
    "max_value": 5,
    "step_value": 0.5,
    "display_type": "stars",
    "tier_labels": ["Poor", "Fair", "Good", "Very Good", "Excellent"]
  },
  {
    "id": 2,
    "name": "Percentage",
    "min_value": 0,
    "max_value": 100,
    "step_value": 1,
    "display_type": "percentage",
    "tier_labels": ["Terrible", "Poor", "Average", "Good", "Excellent"]
  },
  {
    "id": 3,
    "name": "Emoji Mood",
    "min_value": 1,
    "max_value": 5,
    "step_value": 1,
    "display_type": "emoji",
    "tier_labels": ["😡", "🙁", "😐", "🙂", "😄"]
  }
]
```

**Interaction Pattern:**
- Used as a lookup for how ratings should be displayed
- Referenced by list_rating_settings
- Provides validation rules for rating inputs

### 6. List Rating Settings Table

**Purpose:** Configures how ratings work for specific lists.

```dbml
Table list_rating_settings {
  list_id uuid [pk, ref: - lists.id]
  rating_system_id integer [ref: > rating_systems.id]
  is_required boolean [default: true]
  display_position integer [default: 0]
}
```

**Key Features:**
- One-to-one relationship with lists
- Connects a list to its chosen rating system
- Configures whether ratings are required
- Controls display order of rating input

**Example List Rating Setting:**
```json
{
  "list_id": "723a4127-e89b-92e3-b456-426614174088",
  "rating_system_id": 1,
  "is_required": true,
  "display_position": 0
}
```

**Interaction Pattern:**
- Created when a list is created or when rating settings are changed
- Used to render the appropriate rating input in entry forms
- Determines validation rules for entry ratings

### 7. Entries Table

**Purpose:** Stores individual rated items within a list.

```dbml
Table entries {
  id uuid [pk, default: `uuid_generate_v4()`]
  list_id uuid [ref: > lists.id, not null]
  user_id uuid [ref: > users.id, not null]
  title text [not null]
  description text
  rating numeric
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
}
```

**Key Features:**
- Associated with both a list and a user
- Core fields like title, description and rating
- The rating field stores the numeric value regardless of display format

**Example Entry:**
```json
{
  "id": "f67e4567-e89b-12d3-a456-426614174555",
  "list_id": "723a4127-e89b-92e3-b456-426614174088",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Sakura Sushi House",
  "description": "Authentic Japanese sushi restaurant with great ambiance",
  "rating": 4.5,
  "created_at": "2025-05-20T19:30:00Z",
  "updated_at": "2025-05-20T19:30:00Z"
}
```

**Interaction Pattern:**
- Central entity for storing ratings
- Parent entity for custom field values
- May optionally have an associated voice memo

### 8. Field Values Table

**Purpose:** Stores the actual values for custom fields on specific entries.

```dbml
Table field_values {
  id uuid [pk, default: `uuid_generate_v4()`]
  entry_id uuid [ref: > entries.id, not null]
  field_id uuid [ref: > custom_fields.id, not null]
  value_text text
  value_number numeric
  value_date timestamptz
  value_boolean boolean
  value_json jsonb
  
  indexes {
    (entry_id, field_id) [unique]
  }
}
```

**Key Features:**
- Links a specific entry to a specific custom field
- Type-specific columns for different value types
- Uniqueness constraint ensures one value per field per entry

**Example Field Values:**
```json
[
  {
    "id": "g78e4567-e89b-12d3-a456-426614174666",
    "entry_id": "f67e4567-e89b-12d3-a456-426614174555",
    "field_id": "a23e4567-e89b-12d3-a456-426614174111",
    "value_text": "Excellent service, very attentive staff",
    "value_number": null,
    "value_date": null,
    "value_boolean": null,
    "value_json": null
  },
  {
    "id": "h89e4567-e89b-12d3-a456-426614174777",
    "entry_id": "f67e4567-e89b-12d3-a456-426614174555",
    "field_id": "b34e4567-e89b-12d3-a456-426614174222",
    "value_text": "Japanese",
    "value_number": null,
    "value_date": null,
    "value_boolean": null,
    "value_json": null
  },
  {
    "id": "i90e4567-e89b-12d3-a456-426614174888",
    "entry_id": "f67e4567-e89b-12d3-a456-426614174555",
    "field_id": "c45e4567-e89b-12d3-a456-426614174333",
    "value_text": null,
    "value_number": null,
    "value_date": "2025-05-15T00:00:00Z",
    "value_boolean": null,
    "value_json": null
  }
]
```

**Interaction Pattern:**
- Created when entries are submitted
- Only the appropriate type column is populated based on the field's type
- Retrieved alongside entries to display complete entry data

### 9. Voice Memos Table

**Purpose:** Stores optional voice recordings associated with entries.

```dbml
Table voice_memos {
  entry_id uuid [pk, ref: - entries.id]
  audio_url text [not null]
  transcription_text text
  ai_summary text
  processing_status text [not null]
  duration_seconds integer
  created_at timestamptz [default: `NOW()`]
}
```

**Key Features:**
- One-to-one relationship with entries (optional)
- Stores reference to audio file, not the audio itself
- Contains both raw transcription and AI-processed summary
- Processing status to track AI workflow state

**Example Voice Memo:**
```json
{
  "entry_id": "f67e4567-e89b-12d3-a456-426614174555",
  "audio_url": "https://storage.example.com/voice-memos/f67e4567-memo.mp3",
  "transcription_text": "I visited Sakura Sushi House last weekend and was really impressed with their nigiri selection. The fish was incredibly fresh and the rice was perfectly seasoned. The ambiance was traditional Japanese with a modern twist. Service was attentive without being intrusive. Prices were reasonable considering the quality. Would definitely come back here again.",
  "ai_summary": "Positive review highlighting fresh fish, well-seasoned rice, traditional Japanese ambiance with modern elements, attentive service, and reasonable pricing. Customer expressed strong intent to return.",
  "processing_status": "completed",
  "duration_seconds": 42,
  "created_at": "2025-05-20T19:28:00Z"
}
```

**Interaction Pattern:**
- Optional addition to entries
- Created when users record thoughts about an item
- Processed asynchronously by AI services
- Retrieved alongside entry data when available

## How It All Works Together

### Creating and Managing Lists:

1. A user (`users`) creates a new list (`lists`), such as "My Favorite Restaurants"
2. They choose a rating system (`rating_systems`) via list rating settings (`list_rating_settings`)
3. They define custom fields (`custom_fields`) like "Cuisine Type", "Price Range", and "Service Notes"

### Adding Entries:

1. User selects a list to add a new entry
2. They enter core entry data (`entries`): title, description, and rating
3. They fill out the custom fields, which get stored in `field_values`
4. Optionally, they record a voice memo (`voice_memos`) with their thoughts
5. When the entry is saved, the list's entry_count increments and last_entry_at updates

### Viewing and Searching:

1. List browsing shows lists with their metadata (entry count, last update time)
2. Entry listings show core fields and ratings according to the chosen display format
3. Entry details show all custom field values and voice memo if available
4. Search can check across entries, custom field values, and even transcribed voice memos

### Premium Features:

Premium users (users.is_premium = true) can access advanced features like:
- Voice memo recording and AI processing
- Advanced custom field types
- More detailed analytics and insights
- Higher storage limits

## UI Implementation

With NativeWind styling and Moti animations, the app provides:

- Glassmorphic card designs for lists and entries
- Fluid micro-animations for rating components
- Dark mode first design with high contrast
- Smooth transitions between screens
- Haptic feedback for important interactions
- Beautiful typography with proper spacing and hierarchy

## Example Queries

### Get all lists for a user:
```sql
SELECT * FROM lists WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' ORDER BY updated_at DESC;
```

### Get an entry with all its custom field values:
```sql
WITH entry_data AS (
  SELECT * FROM entries WHERE id = 'f67e4567-e89b-12d3-a456-426614174555'
),
field_data AS (
  SELECT 
    cf.name as field_name, 
    cf.field_type_id,
    fv.value_text,
    fv.value_number,
    fv.value_date,
    fv.value_boolean,
    fv.value_json
  FROM field_values fv
  JOIN custom_fields cf ON fv.field_id = cf.id
  WHERE fv.entry_id = 'f67e4567-e89b-12d3-a456-426614174555'
),
voice_data AS (
  SELECT * FROM voice_memos WHERE entry_id = 'f67e4567-e89b-12d3-a456-426614174555'
)
SELECT 
  e.*,
  json_agg(fd.*) as custom_fields,
  vm.audio_url,
  vm.transcription_text,
  vm.ai_summary
FROM entry_data e
LEFT JOIN field_data fd ON true
LEFT JOIN voice_data vm ON true
GROUP BY e.id, vm.audio_url, vm.transcription_text, vm.ai_summary;
```

### Get rating distribution for a list:
```sql
SELECT 
  FLOOR(rating) as rating_floor, 
  COUNT(*) as count
FROM entries 
WHERE list_id = '723a4127-e89b-92e3-b456-426614174088'
GROUP BY FLOOR(rating)
ORDER BY rating_floor;
```

## Conclusion

The RatePal database schema is designed to be flexible, normalized, and scalable. It allows for user-created lists with custom fields while maintaining good performance through appropriate indexing. The schema supports both current functionality and future expansion with features like voice memos, while keeping core rating functionality straightforward and efficient.
