# Time Constraint System for ISGCONF Meal Coupons

## Overview

The time constraint system ensures that meal coupons are only active and claimable during their designated time slots. This document explains how the system works and how to use it in different components.

## Key Concepts

### Meal Time Status

A meal can have one of three time statuses:

- **upcoming**: The meal's start time is in the future
- **active**: The current time is between the meal's start and end time
- **past**: The meal's end time has already passed

### Card States

Based on the time status and whether a meal is claimed, meal cards can have the following states:

1. **active**: Meal is within its active time window and not claimed
2. **claimed**: Meal has been claimed by the user
3. **locked-past**: Meal's time window has passed
4. **locked-upcoming**: Meal's time window hasn't started yet

## Using the Time Constraint System

### 1. Check if a Meal is Active

Use the `isTimeSlotActive` function from `timeUtils.ts` to check if a meal slot is currently active:

```typescript
import { isTimeSlotActive } from "../utils/timeUtils";
import { MealSlot } from "../types";

const mealSlot: MealSlot = {
  /* ... */
};
if (isTimeSlotActive(mealSlot)) {
  // Meal is active and can be claimed
} else {
  // Meal is not active (either upcoming or past)
}
```

### 2. Get Meal Time Status

Use the `getMealTimeStatus` function to get the detailed status of a meal:

```typescript
import { getMealTimeStatus } from "../utils/timeUtils";
import { MealSlot } from "../types";

const mealSlot: MealSlot = {
  /* ... */
};
const status = getMealTimeStatus(mealSlot); // 'upcoming', 'active', or 'past'
```

### 3. Determine Card Appearance

Use the helper functions in `cardHelpers.ts` to determine how a card should be displayed:

```typescript
import {
  getCardState,
  getCardStyles,
  getIcon,
  getStatusText,
} from "../utils/cardHelpers";

const isClaimed = false;
const timeStatus = getMealTimeStatus(mealSlot);
const cardState = getCardState(isClaimed, timeStatus);
const styles = getCardStyles(cardState);
const icon = getIcon(cardState);
const statusText = getStatusText(cardState, mealSlot.name);
```

### 4. Prevent Claiming Outside Time Windows

In your component or context where claiming logic is implemented:

```typescript
import { isTimeSlotActive } from "../utils/timeUtils";

function claimMeal(mealSlot) {
  if (!isTimeSlotActive(mealSlot)) {
    // Show error message or prevent claim action
    return false;
  }

  // Process claim...
  return true;
}
```

## Implementation in Components

### MealCard Component

The `MealCard` component uses the time constraint system to:

1. Display different visual states based on time status
2. Prevent claiming meals outside active time windows
3. Show appropriate status messages to users

### FamilyCouponCard Component

Similarly, the `FamilyCouponCard` component implements the same time-based constraints for family meal cards.

### CouponContext

The `CouponContext` validates meal time constraints before processing claims, ensuring that business rules are enforced at the data layer.
