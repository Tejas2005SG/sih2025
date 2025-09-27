import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PersonalInformation from '../../components/registration/PersonalInformation';
import MedicalHistory from '../../components/registration/MedicalHistory';
import DoshaAssessment from '../../components/registration/DoshaAssessment';
import ReviewSubmit from '../../components/registration/ReviewSubmit';
import SMSVerification from '../../components/registration/SMSVerification';

const Register = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register/personal-info" replace />} />
      <Route path="/personal-info" element={<PersonalInformation />} />
      <Route path="/medical-history" element={<MedicalHistory />} />
      <Route path="/dosha-assessment" element={<DoshaAssessment />} />
      <Route path="/review-submit" element={<ReviewSubmit />} />
      <Route path="/verify-sms" element={<SMSVerification />} />
    </Routes>
  );
};

export default Register;