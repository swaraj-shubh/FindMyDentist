export interface Clinic {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  image: string;
  description: string;
  verified: boolean;
  openTime: string;
  closeTime: string;
  dentistCount: number;
  chairs: number;
  lat: number;
  lng: number;
  amenities: string[];
}

export interface Message {
  id: string;
  clinicId: string;
  patientId: string;
  sender: "patient" | "clinic";
  body: string;
  createdAt: string;
  read: boolean;
}
