import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface MotionListProps extends React.ComponentProps<typeof motion.div> {
    children: ReactNode;
    delay?: number;
    staggerDelay?: number;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (custom = {}) => ({
        opacity: 1,
        transition: {
            staggerChildren: custom.staggerDelay || 0.05,
            delayChildren: custom.delay || 0,
        },
    }),
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

export function MotionList({
    children,
    className,
    delay = 0,
    staggerDelay = 0.05,
    ...props
}: MotionListProps) {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            custom={{ delay, staggerDelay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export const MotionItem = motion.div;
export { itemVariants };
