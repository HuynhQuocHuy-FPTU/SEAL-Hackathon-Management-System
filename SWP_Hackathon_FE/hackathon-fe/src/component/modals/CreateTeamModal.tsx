import { AnimatePresence, motion } from "framer-motion";
import FormTeam from "../team/createTeam/FormTeam";

type CreateTeamModalProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateTeamModal({
    isOpen,
    setIsOpen,
}: CreateTeamModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 "
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] rounded-3xl mx-4 overflow-hidden"
                    >
                        <div className="overflow-y-auto max-h-[90vh]">
                            <FormTeam />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}