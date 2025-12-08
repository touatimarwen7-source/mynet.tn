import React from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import StepDocuments from './StepDocuments';
import StepSeven from './StepSeven';

/**
 * Affiche le composant d'étape approprié en fonction de l'étape actuelle
 * @param {object} props - Les propriétés passées depuis CreateTenderWizard
 */
const TenderStepRenderer = (props) => {
  const { currentStep } = props;

  switch (currentStep) {
    case 0:
      // Étape 1: Informations de base
      return <StepOne {...props} />;
    case 1:
      // Étape 2: Calendrier et dates
      return <StepTwo {...props} />;
    case 2:
      // Étape 3: Lots de l'appel d'offres
      return <StepThree {...props} />;
    case 3:
      // Étape 4: Critères d'éligibilité
      return <StepFour {...props} />;
    case 4:
      // Étape 5: Critères d'évaluation
      return <StepFive {...props} />;
    case 5:
      // Étape 6: Documents
      return <StepDocuments {...props} />;
    case 6:
      // Étape 7: Révision et publication
      return <StepSeven {...props} />;
    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Étape inconnue. Veuillez revenir en arrière.
        </div>
      );
  }
};

export default TenderStepRenderer;t TenderStepRenderer;
