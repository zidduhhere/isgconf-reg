# ISGCONF UI Component Library

This directory contains reusable UI components for the ISGCONF site. These components are designed to be modular, customizable, and easy to use across the application.

## Available Components

### ImagePlaceholder

A versatile image placeholder component with customizable styling and icon support.

```tsx
<ImagePlaceholder
  icon={<ImageIcon />}
  width="w-full"
  height="h-48"
  rounded="rounded-lg"
  bgColor="bg-gray-100"
  iconColor="text-gray-400"
/>
```

### Instructions

A component for displaying a list of instructions with optional highlighting.

```tsx
<Instructions
  title="How it works:"
  items={[
    { text: "Step 1: Do this thing" },
    { text: "Step 2: Do this important thing", isHighlighted: true },
    { text: "Step 3: Complete the process" },
  ]}
  footer="Contact support for assistance"
/>
```

### EventDetails

A component for displaying structured event information in a customizable grid layout.

```tsx
<EventDetails
  title="Conference Details"
  details={[
    { label: "Date", value: "October 4-5, 2025" },
    { label: "Location", value: "Thiruvananthapuram" },
    { label: "Venue", value: "Grand Hotel Conference Center" },
  ]}
  columns={2}
/>
```

### FeatureCard

A component for displaying individual features with icons, titles, and descriptions.

```tsx
<FeatureCard
  icon={<Stethoscope />}
  title="Medical Sessions"
  description="Expert-led workshops and presentations"
  bgColor="bg-blue-50"
  iconColor="text-blue-600"
/>
```

### FeatureGrid

A component for displaying multiple features in a responsive grid layout.

```tsx
<FeatureGrid
  columns={2}
  features={[
    {
      icon: <Stethoscope />,
      title: "Medical Sessions",
      description: "Expert-led workshops",
    },
    {
      icon: <Users />,
      title: "Networking",
      description: "Connect with peers",
    },
  ]}
  staggered={true}
  animationDelayIncrement={0.1}
/>
```

## Usage Examples

For comprehensive examples of all components and their variations, visit the Component Library at `/ui-components` in the application (development environment only).

## Guidelines

1. All components should be fully typed with TypeScript interfaces
2. Use Tailwind CSS for styling
3. Provide sensible defaults but allow customization via props
4. Export all components through the `index.ts` file
5. Document component props and provide examples

## Adding New Components

1. Create the component in this directory
2. Add TypeScript interfaces for props
3. Export the component in `index.ts`
4. Add example usage to the appropriate example file
5. Update this README with basic documentation
