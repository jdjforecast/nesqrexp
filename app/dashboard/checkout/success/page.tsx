'use client';

import { useRouter } from 'next/navigation';
import { SuccessView } from '@/components/success-view';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  const handleAction = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto">
      <SuccessView
        title="¡GRACIAS POR PARTICIPAR!"
        message="Tu pedido será entregado al cierre del encuentro."
        imageUrl="/nestle-pharma-bag.png"
        actionLabel="Aceptar"
        onAction={handleAction}
        showConfetti={true}
      />
    </div>
  );
} 