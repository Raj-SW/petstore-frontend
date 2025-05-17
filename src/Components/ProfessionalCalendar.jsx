const handleDateSelect = (selectInfo) => {
  setSelectedDate(selectInfo.start);
  setSelectedTime(selectInfo.start);
  setShowAppointmentForm(true);
  setSelectedAppointment(null);
  setFormData({
    title: "",
    description: "",
    datetimeISO: selectInfo.start.toISOString(),
    duration: 60,
    status: "Pending",
    type: professional.type,
    role: professional.role,
    location: professional.location,
    petId: "",
    petName: "",
    petType: "",
    ownerId: "",
    ownerName: "",
    notes: "",
    professionalId: professional.id,
    professionalName: professional.name,
  });
};
