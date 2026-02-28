import { motion } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';

export default function WelcomeScreen({ onGetStarted }) {
    return (
        <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="welcome-screen"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="welcome-logo-box"
            >
                <ShoppingCart size={48} />
            </motion.div>
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="welcome-title"
            >
                Welcome to MyBusiness
            </motion.h1>
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="welcome-subtitle"
            >
                Your one-stop solution for quality goods. Experience a seamless shopping journey today.
            </motion.p>
            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="btn-primary"
                style={{ padding: '16px 40px', fontSize: '1.25rem' }}
            >
                Get Started <ChevronRight size={24} />
            </motion.button>
        </motion.div>
    );
}
