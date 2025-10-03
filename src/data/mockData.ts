import { MealSlot } from "../types";

// Event dates - adjust these for your actual event
const today = new Date(2025, 9, 3); //
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
    id: "0",
    name: "Lunch - Day 1",
    day: 1,
    type: "lunch",
    startTime: "12:00",
    endTime: "14:00",
    eventDate: eventDay1.toISOString().split("T")[0],
  },
  {
    id: "1",
    name: "GALA DINNER - DAY 1",
    day: 1,
    type: "dinner",
    startTime: "14:00",
    endTime: "24:00",
    eventDate: eventDay1.toISOString().split("T")[0],
  },
  {
    id: "2",
    name: "Lunch - Day 2",
    day: 2,
    type: "lunch",
    startTime: "12:00",
    endTime: "14:00",
    eventDate: eventDay2.toISOString().split("T")[0],
  }
];