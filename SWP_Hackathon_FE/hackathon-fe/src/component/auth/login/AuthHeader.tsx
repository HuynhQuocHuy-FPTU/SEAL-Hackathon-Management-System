import { motion } from 'motion/react'

export default function AuthHeader() {
    return (
        <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-sans text-5xl font-black bg-linear-to-r from-orange-500 via-pink-500 to-cyan-600 bg-clip-text text-transparent tracking-tight"
        >
          SEAL
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-sans text-lg text-slate-500 mt-2 font-medium"
        >
          Hackathon Workspace
        </motion.p>
        </div>
    );
}