export interface Dentist {
  id: string;
  userId: string;
  slug: string;
  name: string;
  gender: "female" | "male";
  specialty: string;
  qualification: string;
  experience: number;
  clinicId: string;
  city: string;
  bio: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  consultationFee: number;
  profileImage: string;
  followers: number;
  languages: string[];
  education: string[];
  services: string[];
}

export interface Review {
  id: string;
  dentistId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}
