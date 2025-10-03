# Exhibitor Meal Management System

## Overview

The Exhibitor Meal Management System is a comprehensive solution for managing meal allocations for exhibitor companies participating in conferences or events. Each company has a specific plan (Diamond, Platinum, Gold, Silver) with different meal allocations, and they can manage their employees and meal claims through a dedicated portal.

## Features

### 🏢 Company Management

- **Supabase Authentication**: Secure login using company ID converted to email format
- **Plan-based Allocations**: Different meal quotas based on subscription plan
- **Real-time Allocation Tracking**: Monitor remaining lunch and dinner allocations

### 🔐 Authentication System

- **Email Format**: Company IDs are converted to lowercase and appended with `@isgcon.com`
  - Example: `EXH001` becomes `exh001@isgcon.com`
- **Default Password**: All exhibitor accounts use the password `participanthere`
- **Supabase Auth Integration**: Uses `signInWithPassword` for secure authentication
- **Session Management**: Automatic logout and session cleanup

### 👥 Employee Management

- **Add/Remove Employees**: Manage company employees who can claim meals
- **Employee Details**: Store name and phone number for each employee
- **Active Status Tracking**: Enable/disable employees as needed

### 🍽️ Meal Claiming System

- **Slot-based Claims**: Claim meals for specific time slots (Lunch Day 1, Lunch Day 2, Gala Dinner)
- **Employee Assignment**: Assign meals to specific employees
- **15-minute Timer**: Claims expire after 15 minutes if not used
- **Real-time Updates**: Instant updates across localStorage and database

### 🔒 Security & Persistence

- **localStorage Backup**: Offline-first approach with localStorage persistence
- **Supabase Integration**: Real-time database synchronization
- **Session Management**: Secure 24-hour login sessions
- **Row Level Security**: Database-level security policies

## Plan Allocations

| Plan         | Lunch Allocation | Dinner Allocation | Total |
| ------------ | ---------------- | ----------------- | ----- |
| **Diamond**  | 5                | 4                 | 9     |
| **Platinum** | 3                | 2                 | 5     |
| **Gold**     | 2                | 0                 | 2     |
| **Silver**   | 1                | 0                 | 1     |

## Authentication Setup

### Default Login Credentials

| Company ID | Email Format      | Password        | Plan     |
| ---------- | ----------------- | --------------- | -------- |
| EXH001     | exh001@isgcon.com | participanthere | Diamond  |
| EXH002     | exh002@isgcon.com | participanthere | Platinum |
| EXH003     | exh003@isgcon.com | participanthere | Gold     |
| EXH004     | exh004@isgcon.com | participanthere | Silver   |

### Setting Up Authentication

1. **Run Database Migration**:

   ```bash
   psql -f database/simple_exhibitor_setup.sql
   ```

2. **Create Supabase Auth Users and Populate Data**:

   ```bash
   node scripts/setup-exhibitor-system.js
   ```

3. **Test the Authentication System**:

   ```bash
   node test-exhibitor-auth-system.js
   ```

4. **Configure Environment Variables**:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISH_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Database Schema

### Authentication Architecture

The system uses **Supabase Auth** with `auth.uid` as the primary key:

- **Authentication**: Each company has a Supabase Auth user account
- **Primary Key**: `auth.uid` is used as the primary key in `exhibitor_companies`
- **Email Format**: Company IDs are converted to email format (`exh001@isgcon.com`)
- **RLS Security**: Row Level Security ensures companies can only access their own data

### Tables

#### `exhibitor_companies`

```sql
- id (UUID, Primary Key, References auth.users(id))
- company_id (VARCHAR, Unique) -- Display ID like "EXH001"
- company_name (VARCHAR)
- phone_number (VARCHAR)
- plan (ENUM: Diamond|Platinum|Gold|Silver)
- lunch_allocation (INTEGER)
- dinner_allocation (INTEGER)
- lunch_used (INTEGER, Default: 0)
- dinner_used (INTEGER, Default: 0)
- created_at, updated_at (TIMESTAMP)
```

#### `exhibitor_employees`

```sql
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key to exhibitor_companies.id/auth.uid)
- employee_name (VARCHAR)
- employee_phone (VARCHAR)
- is_active (BOOLEAN, Default: true)
- created_at, updated_at (TIMESTAMP)
```

#### `exhibitor_meal_claims`

```sql
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key to exhibitor_companies.id/auth.uid)
- employee_id (UUID, Foreign Key)
- meal_slot_id (VARCHAR) -- 'lunch_1', 'lunch_2', 'gala_1'
- meal_type (ENUM: lunch|dinner)
- status (BOOLEAN) -- true = available, false = claimed
- claimed_at, expires_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

## Setup Instructions

### 1. Database Setup

Run the migration script to create the database schema:

```bash
# Apply the migration to your Supabase database
psql -h your-supabase-host -U postgres -d postgres -f exhibitor_migration.sql
```

### 2. Default Login Credentials

The system comes with pre-configured test companies:

| Company ID | Company Name            | Plan     | Password     |
| ---------- | ----------------------- | -------- | ------------ |
| EXH001     | Diamond Tech Solutions  | Diamond  | exhibitor123 |
| EXH002     | Platinum Industries Ltd | Platinum | exhibitor123 |
| EXH003     | Gold Innovations Inc    | Gold     | exhibitor123 |
| EXH004     | Silver Enterprises Co   | Silver   | exhibitor123 |

### 3. Access the System

Navigate to `/exhibitor` in your application to access the exhibitor portal.

## API Integration

### Core Functions

#### Authentication

```typescript
// Login with company credentials
const success = await login(companyId, password);

// Logout and clear session
logout();
```

#### Employee Management

```typescript
// Add new employee
await addEmployee(employeeName, employeePhone);

// Update employee details
await updateEmployee(employeeId, updates);

// Remove employee (soft delete)
await removeEmployee(employeeId);
```

#### Meal Claims

```typescript
// Claim meal for employee
await claimMeal(employeeId, mealSlotId, mealType);

// Check available allocations
const allocations = getAvailableAllocations();
// Returns: { lunch: number, dinner: number }
```

## Component Structure

```
ExhibitorApp
├── ExhibitorLogin (Authentication)
└── ExhibitorDashboard
    ├── Company Overview
    ├── Employee Management
    └── Meal Allocation Cards
        └── ExhibitorMealCard (Per meal slot)
```

## Key Features

### 🔄 Real-time Synchronization

- **Dual Storage**: localStorage for offline persistence + Supabase for real-time sync
- **Conflict Resolution**: localStorage takes precedence for immediate operations
- **Background Sync**: Automatic database updates with fallback handling

### ⏱️ Timer Management

- **15-minute Claim Window**: Claims automatically expire to prevent food waste
- **Real-time Countdown**: Live timer display showing remaining time
- **Auto-cleanup**: Expired claims are automatically removed

### 🎯 Allocation Enforcement

- **Strict Limits**: Cannot exceed plan-based allocations
- **Real-time Validation**: Immediate feedback on allocation limits
- **Usage Tracking**: Monitor used vs. total allocations

### 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Progressive Enhancement**: Works on all screen sizes
- **Accessibility**: WCAG compliant with proper ARIA labels

## Business Logic

### Meal Claiming Process

1. **Employee Selection**: Choose from active company employees
2. **Allocation Check**: Verify remaining meals for meal type
3. **localStorage Claim**: Immediate local storage update
4. **Database Sync**: Background Supabase synchronization
5. **Timer Start**: 15-minute countdown begins
6. **Auto-expire**: Cleanup expired claims

### Session Management

- **24-hour Sessions**: Automatic logout after 24 hours
- **Secure Storage**: Encrypted session data in localStorage
- **Cross-tab Sync**: Session state synchronized across browser tabs

## Error Handling

### Graceful Degradation

- **Offline Mode**: Full functionality with localStorage when database unavailable
- **Sync Recovery**: Automatic synchronization when connection restored
- **User Feedback**: Clear error messages and retry options

### Validation

- **Input Validation**: Client-side validation for all forms
- **Business Rules**: Enforcement of allocation limits and constraints
- **Data Integrity**: Database constraints and triggers for consistency

## Performance Optimizations

### React Optimizations

- **Memo Components**: Prevent unnecessary re-renders
- **useCallback Hooks**: Stable function references
- **useRef for Timers**: Avoid re-render loops

### Data Management

- **Optimistic Updates**: Immediate UI updates with background sync
- **Efficient Queries**: Indexed database queries for fast performance
- **Caching Strategy**: Smart caching with localStorage backup

## Security Considerations

### Authentication

- **Company-based Auth**: Each company only accesses their own data
- **Session Tokens**: Secure session management with expiration
- **Password Protection**: Default passwords (should be changed in production)

### Data Protection

- **Row Level Security**: Database-level access control
- **Input Sanitization**: Protection against injection attacks
- **HTTPS Only**: Secure transmission of all data

## Troubleshooting

### Common Issues

#### Login Problems

- Verify company ID and password
- Check database connection
- Clear localStorage if session corrupted

#### Sync Issues

- Check network connectivity
- Verify Supabase configuration
- Monitor browser console for errors

#### Timer Problems

- Check system clock accuracy
- Verify localStorage permissions
- Clear expired claims manually if needed

### Debug Tools

- Browser DevTools for localStorage inspection
- Network tab for API call monitoring
- Console logs for operation tracking

## Future Enhancements

### Potential Features

- **QR Code Generation**: Generate QR codes for easy meal pickup
- **Notification System**: Email/SMS notifications for meal claims
- **Analytics Dashboard**: Usage statistics and reporting
- **Bulk Operations**: Mass employee import/export
- **Custom Meal Plans**: Configurable allocation plans
- **Real-time Chat**: Support chat for assistance

### Scalability Considerations

- **Database Sharding**: Scale for multiple events
- **CDN Integration**: Faster asset delivery
- **Load Balancing**: Handle high concurrent usage
- **Caching Layer**: Redis/Memcached for performance

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
