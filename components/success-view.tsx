'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SuccessViewProps {
  title: string;
  message: string;
  imageUrl: string;
  actionLabel?: string;
  onAction?: () => void;
  showConfetti?: boolean;
}

export function SuccessView({
  title,
  message,
  imageUrl,
  actionLabel = 'Aceptar',
  onAction,
  showConfetti = true,
}: SuccessViewProps) {
  useEffect(() => {
    if (showConfetti) {
      // Launch confetti effect
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [showConfetti]);

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div className="nestle-gradient p-8 text-white text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-white/90">{message}</p>
          </motion.div>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative w-48 h-48 mb-6"
          >
            <Image
              src={imageUrl}
              alt="Success"
              fill
              className="object-contain"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button 
              onClick={onAction} 
              className="btn-primary min-w-[200px]"
            >
              {actionLabel}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
} 