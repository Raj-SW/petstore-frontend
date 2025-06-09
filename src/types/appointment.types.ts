export type AppointmentType = "vet" | "grooming";
export type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";
export type AppointmentRole = "Veterinarian" | "Groomer";

export interface Appointment {
  id: number;
  title: string;
  datetimeISO: string;
  description: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  type: "vet" | "grooming";
  role: "Veterinarian" | "Groomer";
  location: string;
  icon?: string;
  petName?: string;
  petType?: string;
  duration?: number; // in minutes
  price?: number;
  notes?: string;
}

export interface AppointmentFormData {
  title: string;
  type: "vet" | "grooming";
  datetime: Date;
  description: string;
  location: string;
  serviceProvider: string;
  petName: string;
  petType: string;
  duration: number;
  price: number;
  notes: string;
}

export interface AppointmentCardProps extends Appointment {
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
}

export interface AppointmentFormProps {
  show: boolean;
  handleClose: () => void;
  onSubmit: (data: AppointmentFormData & { datetimeISO: string }) => void;
  initialData: Appointment | null;
}

export interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentCreate: (data: AppointmentFormData) => void;
  onAppointmentUpdate: (data: Appointment) => void;
  onAppointmentDelete: (id: number) => void;
}

export interface ServiceProvider {
  id: number;
  name: string;
  type: AppointmentType;
  role: AppointmentRole;
  avatar: string;
  specialties?: string[];
  rating?: number;
  availableSlots?: string[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: number;
}
