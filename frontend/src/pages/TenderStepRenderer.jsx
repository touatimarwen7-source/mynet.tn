import React from 'react';
import StepOne from '../components/TenderSteps/StepOne';
import StepTwo from '../components/TenderSteps/StepTwo';
import StepThree from '../components/TenderSteps/StepThree';
import StepFour from '../components/TenderSteps/StepFour';
import StepFive from '../components/TenderSteps/StepFive';
import StepDocuments from '../components/TenderSteps/StepDocuments';
import StepSeven from '../components/TenderSteps/StepSeven';

/**
 * Renders the appropriate step component based on the current step index.
 * @param {object} props
 * @param {number} props.currentStep - The current active step index.
 * @param {object} props.formData - The current form data.
 * @param {Function} props.setFormData - Function to update the form data.
 * @param {Function} props.handleChange - Function to handle input changes.
 * @param {boolean} props.loading - The loading state.
 * @param {number} props.totalCriteria - The total of evaluation criteria.
 * @returns {JSX.Element | null}
 */
const TenderStepRenderer = ({ currentStep, formData, setFormData, handleChange, loading, totalCriteria }) => {
  switch (currentStep) {
    case 0:
      return <StepOne formData={formData} handleChange={handleChange} loading={loading} />;
    case 1:
      return <StepTwo formData={formData} handleChange={handleChange} loading={loading} />;
    case 2:
      return <StepThree formData={formData} setFormData={setFormData} loading={loading} />;
    case 3:
      return <StepFour formData={formData} setFormData={setFormData} loading={loading} />;
    case 4:
      return <StepFive formData={formData} handleChange={handleChange} totalCriteria={totalCriteria} loading={loading} />;
    case 5:
      return <StepDocuments formData={formData} setFormData={setFormData} loading={loading} />;
    case 6:
      return <StepSeven formData={formData} handleChange={handleChange} loading={loading} />;
    default:
      return null;
  }
};

export default TenderStepRenderer;