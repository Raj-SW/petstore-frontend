import { useState, useCallback, useEffect } from "react";
import AppointmentService from "../Services/localServices/appointmentService";

export const useAppointments = (initialFilters = {}) => {
  const [state, setState] = useState({
    appointments: [],
    loading: true,
    error: null,
    filters: {
      type: "all",
      searchQuery: "",
      dateRange: null,
      ...initialFilters,
    },
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      let appointments;

      if (state.filters.type === "all") {
        appointments = await AppointmentService.getAll();
      } else {
        appointments = await AppointmentService.getByType(state.filters.type);
      }

      setState((prev) => ({
        ...prev,
        appointments,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, [state.filters.type]);

  const updateFilters = useCallback((newFilters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const handleAppointmentSubmit = useCallback(async (appointmentData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const newAppointment = await AppointmentService.create(appointmentData);
      setState((prev) => ({
        ...prev,
        appointments: [...prev.appointments, newAppointment],
        loading: false,
      }));
      return newAppointment;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const handleAppointmentUpdate = useCallback(async (id, appointmentData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedAppointment = await AppointmentService.update(
        id,
        appointmentData
      );
      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.map((appt) =>
          appt.id === id ? updatedAppointment : appt
        ),
        loading: false,
      }));
      return updatedAppointment;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const handleAppointmentDelete = useCallback(async (id) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await AppointmentService.delete(id);
      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.filter((appt) => appt.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    ...state,
    fetchAppointments,
    updateFilters,
    handleAppointmentSubmit,
    handleAppointmentUpdate,
    handleAppointmentDelete,
  };
};
