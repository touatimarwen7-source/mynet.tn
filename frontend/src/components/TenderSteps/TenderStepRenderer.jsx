import React from 'react';
import StepOne from '../components/TenderSteps/StepOne';
import StepTwo from '../components/TenderSteps/StepTwo';
import StepThree from '../components/TenderSteps/StepThree';
import StepFour from '../components/TenderSteps/StepFour';
import StepFive from '../components/TenderSteps/StepFive';
import StepSix from '../components/TenderSteps/StepSix';

/**
 * يعرض مكون الخطوة المناسب بناءً على الخطوة الحالية في المعالج.
 * @param {object} props - الخصائص الممررة من المكون الأب (CreateTenderWizard)
 */
const TenderStepRenderer = (props) => {
  const { currentStep } = props;

  // استخدام switch لتحديد المكون الذي سيتم عرضه
  switch (currentStep) {
    case 0:
      // الخطوة الأولى: المعلومات الأساسية
      return <StepOne {...props} />;
    case 1:
      // الخطوة الثانية: الجدولة والتواريخ
      return <StepTwo {...props} />;
    case 2:
      // الخطوة الثالثة: بنود المناقصة
      return <StepThree {...props} />;
    case 3:
      // الخطوة الرابعة: شروط الأهلية
      return <StepFour {...props} />;
    case 4:
      // الخطوة الخامسة: معايير التقييم والوثائق
      return <StepFive {...props} />;
    case 5:
      // الخطوة السادسة: المراجعة والنشر
      return <StepSix {...props} />;
    default:
      // حالة افتراضية في حال وجود خطوة غير معروفة
      return <div>خطوة غير معروفة. يرجى العودة.</div>;
  }
};

export default TenderStepRenderer;