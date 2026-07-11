import { useState } from "react";
import { FaCalendarCheck, FaWhatsapp, FaPhone } from "react-icons/fa";
import AppointmentModal from "../../../../Components/AppointmentModal/AppointmentModal";
import "./FinalCtaStrip.css";

const WHATSAPP_NUMBER = "23057580480";
const CONSULTATION_HOURS = ["Mon, Wed, Thu, Sat: 4:30 PM – 6:00 PM"];

const FinalCtaStrip = () => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="fcs-section">
      <div className="fcs-inner">
        <h2 className="fcs-title">Need Veterinary Advice?</h2>
        <p className="fcs-sub">We're here for you and your pet.</p>

        <div className="fcs-actions">
          <button type="button" className="fcs-btn fcs-btn-primary" onClick={() => setBookingOpen(true)}>
            <FaCalendarCheck size={17} />
            Book Appointment
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fcs-btn fcs-btn-outline"
          >
            <FaWhatsapp size={18} />
            WhatsApp Us
          </a>
          <a href={`tel:+${WHATSAPP_NUMBER}`} className="fcs-btn fcs-btn-outline">
            <FaPhone size={16} />
            Call Us
          </a>
        </div>
      </div>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book an Appointment"
        description="We're here for you and your pet."
        hours={CONSULTATION_HOURS}
        waMessage="Hi, I'd like to book a vet appointment."
      />
    </section>
  );
};

export default FinalCtaStrip;
