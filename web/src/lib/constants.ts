export const SESSION_COOKIE = "fmd_user";

export const AI_DISCLAIMER =
  "FMD provides educational guidance and does not replace professional dental diagnosis. For severe or urgent symptoms, seek appropriate professional care.";

export const CITIES = ["Bengaluru", "Hyderabad", "Mumbai", "Chennai", "Delhi"] as const;

export const LANGUAGES = ["English", "Hindi", "Kannada", "Telugu", "Tamil", "Marathi", "Malayalam"] as const;

/** Bookable slots; the booking service removes taken and past ones. */
export const SLOT_TIMES = ["09:30", "10:30", "11:30", "12:30", "15:00", "16:00", "17:30", "18:30"] as const;
