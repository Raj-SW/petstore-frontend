import { useState } from 'react';

const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

const useFormValidation = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    let isValid = false;

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.trim() === '') {
          errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
        } else if (!NAME_REGEX.test(value)) {
          errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1)} must not contain special characters or numbers.`;
        } else {
          isValid = true;
        }
        break;
      case 'email':
        if (value.trim() === '') {
          errorMsg = 'Email is required.';
        } else if (!EMAIL_REGEX.test(value)) {
          errorMsg = 'Please enter a valid email address.';
        } else {
          isValid = true;
        }
        break;
      case 'password':
        if (value.trim() === '') {
          errorMsg = 'Password is required.';
        } else if (!PASSWORD_REGEX.test(value)) {
          errorMsg = 'Password must be at least 4 characters long, and include at least one uppercase letter, one number, and one special character.';
        } else {
          isValid = true;
        }
        break;
      case 'confirmPassword':
        if (value.trim() === '') {
          errorMsg = 'Please confirm your password.';
        } else if (value !== formData.password) {
          errorMsg = 'Passwords do not match.';
        } else {
          isValid = true;
        }
        break;
      default:
        break;
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: errorMsg,
    }));

    setValid(prevValid => ({
      ...prevValid,
      [name]: isValid,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateField(name, value);
  };

  const validateAllFields = () => {
    const newErrors = {};
    const newValid = {};

    Object.keys(formData).forEach((field) => {
      const value = formData[field];
      validateField(field, value);
      newErrors[field] = errors[field] || '';
      newValid[field] = valid[field] || false;
    });

    setErrors(newErrors);
    setValid(newValid);

    return { newErrors, newValid };
  };

  return { formData, errors, valid, handleInputChange, validateAllFields };
};

export default useFormValidation;
