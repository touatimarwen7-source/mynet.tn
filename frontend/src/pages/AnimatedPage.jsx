import { motion } from 'framer-motion';

// تعريف متغيرات التحريك
const pageAnimation = {
  initial: {
    opacity: 0,
    x: '-100vw', // تبدأ من خارج الشاشة على اليسار
  },
  in: {
    opacity: 1,
    x: 0, // تتحرك إلى مكانها الطبيعي
  },
  out: {
    opacity: 0,
    x: '100vw', // تخرج من الشاشة إلى اليمين
  },
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageAnimation} transition={{ duration: 0.5, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
};

export default AnimatedPage;