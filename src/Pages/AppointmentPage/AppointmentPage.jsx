import React, { useEffect, useContext, useState } from "react";
import { Row, Col, Form, Button, Modal } from "react-bootstrap";

//Date picker imports
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//schedueX
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createResizePlugin } from "@schedule-x/resize";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createCurrentTimePlugin } from "@schedule-x/current-time";

//css and assets import
import "@schedule-x/theme-default/dist/index.css";
import "./Appointment.css";
import profilepic from "../../assets/Decoratives/roundedProfilePic.png";

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
export const AppointmentPage = () => {
  const [show, setShow] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [error, setError] = useState("");
  const events = [
    {
      id: "1",
      title: "Event 1",
      start: "2024-11-28 09:00",
      end: "2024-11-28 10:00",
    },
    {
      id: "2",
      title: "Event 2",
      start: "2024-11-30 09:00",
      end: "2024-11-30 10:00",
    },
  ];
  const handleClose = () => {
    setShow(false);
    setSelectedTime(null);
    setEndTime(null);
    setError("");
  };

  const handleShow = (dateTime) => {
    const date = new Date(dateTime);
    if (isNaN(date)) {
      return null;
    }
    setSelectedTime(date);
    setShow(true);
    console.log("Selected Date Time on modal", dateTime);
  };

  const validateBooking = () => {
    if (!selectedTime || !endTime) {
      setError("Please select both start and end times.");
      return false;
    }

    // Ensure the booking is at least 30 minutes
    const duration = (endTime - selectedTime) / (1000 * 60); // duration in minutes
    if (duration < 30) {
      setError("Booking duration must be at least 30 minutes.");
      return false;
    }

    // Check for overlapping events
    const isClashing = events.some((event) => {
      return (
        (selectedTime >= event.start && selectedTime < event.end) ||
        (endTime > event.start && endTime <= event.end) ||
        (selectedTime <= event.start && endTime >= event.end)
      );
    });

    if (isClashing) {
      setError(
        "The selected time slot is already booked. Please choose a different time."
      );
      return false;
    }

    setError("");
    return true;
  };

  // Calendar configs
  const plugins = [
    createDragAndDropPlugin(),
    createEventsServicePlugin(),
    createResizePlugin(15),
    createEventModalPlugin(),
    createCurrentTimePlugin(),
  ];
  const calendar = useCalendarApp(
    {
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
        createViewMonthAgenda(),
      ],
      events: events,
      isReponsive: true,
      skipValidation: true,

      callbacks: {
        onRangeUpdate(range) {
          console.log("new calendar range start date", range.start);
          console.log("new calendar range end date", range.end);
        },
        onEventUpdate(updatedEvent) {
          console.log("onEventUpdate", updatedEvent);
        },
        onEventClick(calendarEvent) {
          console.log("onEventClick", calendarEvent);
        },
        onDoubleClickEvent(calendarEvent) {
          console.log("onDoubleClickEvent", calendarEvent);
        },
        onClickDate(dateTime) {
          handleShow(dateTime);
          console.log("onClickDate", dateTime);
        },
        onClickDateTime(dateTime) {
          handleShow(dateTime);
          console.log("onClickDateTime", dateTime);
        },
        onDoubleClickDateTime(dateTime) {
          console.log("onDoubleClickDateTime", dateTime);
        },
        onClickPlusEvents(dateTime) {
          console.log("onClickPlusEvents", dateTime);
        },
        onSelectedDateUpdate(dateTime) {
          handleShow(dateTime);
          console.log("onSelectedDateUpdate", dateTime);
        },
      },
    },
    plugins
  );

  useEffect(() => {
    // get all events
    console.log("getting calendar events");
    calendar.eventsService.getAll();
  }, []);

  const handleSave = () => {
    if (validateBooking()) {
      // Save logic here
      console.log("Booking saved:", {
        start: selectedTime,
        end: endTime,
      });
      calendar.eventsService.add({
        title: "Event 3",
        start: formatDateTime(selectedTime),
        end: formatDateTime(endTime),
        id: calendar.eventsService.getAll().length + 1,
      });
      console.log(calendar.eventsService.getAll());
      handleClose();
    }
  };
  return (
    <div className="vet-appointment-container p-4">
      <Row>
        {/* Sidebar Section */}
        <Col md={3}>
          <div className="sidebar d-flex flex-column p-3 border rounded">
            <h5 className="mb-4">Pet Grooming</h5>
            <h5 className="active mb-4">Vet Appointment</h5>
            <h5 className="mb-4">Veterinary Appointment</h5>
            <h5 className="mb-4">Setting</h5>
          </div>
        </Col>

        {/* Profile and Appointment Details */}
        <Col
          className="d-flex flex-column justify-content-start align-items-center"
          md={9}
        >
          <div className="Resource-Person-Card flex-column flex-md-row m-2">
            <div className="RP-Profile-Img">
              <img src={profilepic} alt="Profile" />
            </div>
            <div className="RP-Description d-flex flex-column">
              <h5 className="RP-Name">Samantha Smith</h5>
              <p className="RP-Location">📍 California</p>
              <p className="RP-Bio">
                Hello, I am Samantha, 27 years old.
                <br />I live with my husband and Papi (my dog). Papi has been
                living with us for 5 years and needs a friend and playmate.
                That's why now that we have a yard, we thought of adopting a
                dog.
              </p>
              <div className="RP-External-Links d-flex flex-column flex-md-row">
                <Col className="d-flex flex-column p-2 gap-3">
                  <p>📧 SamanthaSmith@gmail.com</p>
                  <p>📞 702-684-2621</p>
                </Col>
                <Col className="d-flex flex-column p-2 gap-3">
                  <p>📍 Las Vegas 1028 Hall Street</p>
                  <p>📸 Samatha.S16</p>
                </Col>
              </div>
            </div>
          </div>

          <Row className="pt-5 ">
            <ScheduleXCalendar calendarApp={calendar} className="" />
          </Row>
        </Col>
      </Row>

      {/* Bootstrap Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <DatePicker
                selected={selectedTime}
                onChange={(dateTime) => setSelectedTime(dateTime)}
                showTimeSelect
                dateFormat="Pp"
                minDate={new Date()}
                className="form-control"
                placeholderText="Select start time"
              />
            </Form.Group>

            <Form.Group controlId="formEndTime" className="mt-3">
              <Form.Label>End Time</Form.Label>
              <DatePicker
                selected={endTime}
                onChange={(dateTime) => setEndTime(dateTime)}
                showTimeSelect
                dateFormat="Pp"
                minDate={selectedTime}
                className="form-control"
                placeholderText="Select end time"
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mt-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber" className="mt-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter your phone number"
              />
            </Form.Group>
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Appointment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default AppointmentPage;
