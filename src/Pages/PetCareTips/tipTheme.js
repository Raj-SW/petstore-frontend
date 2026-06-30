/**
 * Shared constants for the Pet Care Tips feature.
 * Animal identity colors + icons, category and difficulty lists.
 */
import {
  FaDog, FaCat, FaDove, FaFish, FaCarrot, FaDragon, FaPaw, FaThLarge,
} from "react-icons/fa";

export const ANIMAL_TYPES = [
  { value: "dog",     label: "Dog",     color: "#1D9E75", tint: "#E1F5EE", icon: FaDog },
  { value: "cat",     label: "Cat",     color: "#7F77DD", tint: "#EEEDFE", icon: FaCat },
  { value: "bird",    label: "Bird",    color: "#EF9F27", tint: "#FAEEDA", icon: FaDove },
  { value: "fish",    label: "Fish",    color: "#378ADD", tint: "#E6F1FB", icon: FaFish },
  { value: "rabbit",  label: "Rabbit",  color: "#639922", tint: "#EAF3DE", icon: FaCarrot },
  { value: "reptile", label: "Reptile", color: "#D85A30", tint: "#FAECE7", icon: FaDragon },
  { value: "other",   label: "Other",   color: "#888780", tint: "#F1EFE8", icon: FaPaw },
];

export const ALL_ANIMALS_OPTION = { value: "", label: "All", icon: FaThLarge };

export const CATEGORIES = [
  "nutrition", "grooming", "health", "training", "exercise", "dental", "behavior",
];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export const getAnimalTheme = (value) =>
  ANIMAL_TYPES.find((a) => a.value === value) || ANIMAL_TYPES.at(-1);

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
