import { motion } from "framer-motion";

export function Friday() {
    return (
        <>
            <motion.div
                className=""
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                Friday
            </motion.div>
        </>
    );
}