# RatePal App - Development ToDo List

## Database Schema Enhancements

### Tables to Add

1. **User Subscriptions Table**
   - Purpose: Track premium subscription details beyond the simple is_premium flag
   - Fields needed:
     - Stripe customer ID
     - Subscription plan type
     - Start and end dates
     - Auto-renewal status
     - Payment history reference
   - Integration with Stripe API for payment processing
   - Implementation priority: High (required for monetization)

2. **User Preferences Table**
   - Purpose: Store user-specific application settings
   - Fields needed:
     - Theme preference (light/dark/system)
     - Notification settings
     - Default rating system
     - Language preference
     - UI customization options
   - Implementation priority: Medium (enhances user experience)

3. **Entry Images Table**
   - Purpose: Allow multiple photos per entry with metadata
   - Fields needed:
     - Image URLs/references
     - Captions
     - Position/order
     - Upload timestamp
   - Storage considerations: Use Supabase Storage for image files
   - Frontend integration with device camera and gallery
   - Implementation priority: High (core feature)

## UI Implementation Tasks

1. **Implement NativeWind Styling Framework**
   - Replace React Native Paper with NativeWind
   - Create base component library with modern UI effects
   - Establish dark mode as primary design with light mode option

2. **Add Moti/Reanimated Animations**
   - Create micro-interactions for ratings components
   - Add fluid transitions between screens
   - Implement haptic feedback on key interactions

3. **Voice Memo Feature**
   - Implement audio recording interface with NativeWind styling
   - Integrate with OpenAI Whisper API for transcription
   - Add GPT-4 processing for summaries and sentiment analysis
   - Create audio playback controls with animations

## Feature Roadmap Priority

1. Core rating functionality with custom fields
2. User authentication and profile management
3. Voice memo and AI processing features
4. Premium subscription integration
5. Offline support and sync capabilities
