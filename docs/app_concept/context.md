### Project Overview  
RatePal is a minimalist mobile app for privately rating personal experiences (e.g., restaurants, books, movies). It focuses on structured, AI-powered reviews and avoids public ratings. Built with Expo for cross-platform compatibility (iOS/Android).  

### Expo Setup  
- **Framework**: Expo (React Native)  
- **Language**: TypeScript  
- **Navigation**: Expo Router (file-based routing)  
- **UI Library**: NativeWind (Tailwind CSS for React Native) with Moti for animations  
- **Backend/Auth**: Supabase (authentication, storage, real-time DB)  
- **Deployment**: Expo Go (development), EAS (production)  

### Authentication Flow  
- **Sign-up**: Email/password or social login (Google/Apple) via Supabase Auth.  
- **Session Management**: Persistent auth state with Supabase session tokens.  
- **Onboarding**: Guided setup for new users (template selection).  

### Core Features  

#### 1. **Themed Lists**  
- Users create lists (e.g., "Restaurants") to organize ratings.  
- Free: 1 list; Premium: Unlimited.  

#### 2. **Custom Fields**  
- Define fields per list (text, number, date, dropdown, image).  
- Free: 3 fields/list; Premium: Unlimited.  

#### 3. **Entries**  
- Title (required), optional rating (0–100), description, custom fields, photos.  
- Free: 1 photo/entry; Premium: up to 5 photos.  

#### 4. **Templates**  
- Pre-built list templates (e.g., "Books," "Travel") for quick setup.  

#### 5. **AI & Voice Memos**  
- Voice-to-text: Record entries, transcribed via OpenAI Whisper.  
- AI Summaries: GPT-4 generates ratings/descriptions from voice input.  
- Free: 1 AI call; Premium: Unlimited.  

#### 6. **Freemium Model**  
- **Free Tier**: Limited lists/entries/photos/AI usage.  
- **Premium**: Unlimited features, CSV export, Stripe payments.  

### Mobile Considerations  
- **Offline Support**: Supabase syncs data when back online.  
- **Gestures**: Swipe to delete/edit entries.  
- **Performance**: Optimized image uploads (Supabase Storage).  

### Modern UI Approach
- **Design System**: Utility-first CSS with NativeWind for modern, customizable interfaces
- **Animations**: Moti/Reanimated for fluid micro-interactions and transitions
- **Visual Style**: Focus on glassmorphism, dark mode first, borderless design, and custom illustrations
- **Experience**: Emphasis on micro-interactions and subtle haptic feedback

### Deployment  
- **Testing**: Expo Go for internal testing.  
- **Production**: EAS for iOS/Android builds.