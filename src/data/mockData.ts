import { Participant, MealSlot } from "../types";

// Pre-loaded participants for the event
export const PARTICIPANTS: Participant[] = [
  { id: "1", phoneNumber: "9387307393", name: "Mr Rahul" },
  { id: "2", phoneNumber: "7306522615", name: "Abi Alif" },
  { id: "3", phoneNumber: "1234567890", name: "Bob Johnson" },
  { id: "4", phoneNumber: "9812642164", name: "Alice Wilson" },
  { id: "5", phoneNumber: "9071274621", name: "Charlie Brown" },
  // Add more participants as needed - total 200
];

// Event dates - adjust these for your actual event
const today = new Date();
const eventDay1 = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
const eventDay2 = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);

export const MEAL_SLOTS: MealSlot[] = [
  {
    id: "day1-lunch",
    name: "Lunch - Day 1",
    day: 1,
    type: "lunch",
    startTime: "12:00",
    endTime: "14:00",
    eventDate: eventDay1.toISOString().split("T")[0],
  },
  {
    id: "day1-dinner",
    name: "GALA DINNER - DAY 1",
    day: 1,
    type: "dinner",
    startTime: "18:00",
    endTime: "23:00",
    eventDate: eventDay1.toISOString().split("T")[0],
  },
  {
    id: "day2-lunch",
    name: "Lunch - Day 2",
    day: 2,
    type: "lunch",
    startTime: "12:00",
    endTime: "14:00",
    eventDate: eventDay2.toISOString().split("T")[0],
  },
  {
    id: "day2-dinner",
    name: "Dinner - Day 2",
    day: 2,
    type: "dinner",
    startTime: "18:00",
    endTime: "20:00",
    eventDate: eventDay2.toISOString().split("T")[0],
  },
];
