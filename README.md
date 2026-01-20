Travelr (React Native)
A robust, full-featured travel organization application built with React Native and Expo Go. 
This app allows users to manage trips, itineraries, packing lists, and complex budgets with automated cross-module data syncing.

📱 App Features
Trip Management: Create and track multiple trips with specific start and end dates.

Intelligent Itinerary: A dual-view system (Calendar and List) to schedule daily activities.

Automated Budgeting: Dedicated budget categories (Flights, Accommodation, etc.) that automatically track expenses added via other modules.

Packing Lists: Category-based packing lists with interactive checkboxes.

Transport & Accommodation Tracking: Detailed logging of flights, trains, and hotels, which automatically inject events into the itinerary and costs into the budget.

🏗 System Architecture
The app follows a modular architecture where UI components are decoupled from storage logic.

1. Data Flow & Inter-connectivity
The standout feature of this app is its Relational Logic. While using AsyncStorage, the app simulates a relational database:

Transport → Budget & Itinerary: When you add a Flight, the app automatically creates a "Spend" entry in the 'Transport' budget and adds a scheduled event to your Itinerary.

Hotel → Budget & Itinerary: Adding a hotel stay creates a financial entry in the 'Accommodation' budget.

Budget → Spends: Deleting a budget category automatically deletes all individual expenses associated with it.

2. Folder Structure
Plaintext

├── src
│   ├── assets          # Images (Backgrounds, Icons)
│   ├── components      # Reusable UI (ViewCard, TextInputBox, ReusableFab)
│   ├── storage         # Logical Layer (AsyncStorage CRUD operations)
│   │   ├── tripStorage.js
│   │   ├── budgetStorage.js
│   │   ├── transportStorage.js
│   │   └── ...
│   ├── screens         # Screen Components (UI & State management)
│   │   ├── Budget.js
│   │   ├── Itinerary.js
│   │   └── ...

💾 Storage Layer 
The app uses AsyncStorage for persistence. Each module has a dedicated storage file that handles complex business logic:

Budget Logic (budgetStorage.js)
Diff Calculation: When updating a spend, the app calculates the difference between the old and new amount to update the budget total, rather than re-scanning all entries.

Protected Categories: Names like "Flights" and "Accommodation" are protected to ensure the automated tracking from other modules doesn't break.

Itinerary Logic (itineraryStorage.js)
Chronological Sorting: Automatically sorts entries by Date first, then by Time, ensuring the user sees their day in the correct order.

Date Formatting: Includes custom logic to convert ISO strings into user-friendly formats (e.g., "Monday Oct 12th").

🎨 UI & UX Design
React Native Paper: Used for Material Design components (Modals, Portals, FABs, and Buttons).

Conditional Rendering: * The Packing screen switches between "List Overview" and "Item Detail."

The Itinerary screen switches between "Month Calendar" and "Daily Schedule."

Forms: All forms utilize KeyboardAvoidingView and TouchableWithoutFeedback to ensure a smooth mobile experience when the on-screen keyboard is active.

🎭 Dynamic Theming Engine
The application features a context-aware UI that adapts its visual language based on the user's destination. 
This is handled by a custom logic layer that maps trip titles to geographical regions.

How it Works
Keyword Extraction: When a user names a trip (e.g., "My Summer in Paris"), the getThemeFromTripName utility scans the title for geographical keywords.

Region Mapping: The app currently supports 9 distinct geographical themes, for example:

Europe: Triggered by "Paris", "Berlin", "Italy", etc.

Visual Feedback: The detected theme is used to produce a specific background image in the homepage. If no key word is recognised, a default theme is applied. 

Implementation in TripSelectorCard
The TripSelectorCard serves as the primary trigger for this system. 
By selecting a trip, the global selectedTrip state is updated, which in turn recalculates the theme for the entire application, providing a seamless transition between different travel environments.

🛠 Tech Stack
Framework: React Native (Expo)

State Management: React Context API (TripContext) for global tripId tracking.

UI Library: React Native Paper

Persistence: @react-native-async-storage/async-storage

Utilities: uuid for unique ID generation, date-fns for date manipulation.
