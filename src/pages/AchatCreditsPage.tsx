import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSupabase } from '../hooks/useSupabase';

const CREDIT_PACKS = [
  { name: 'Starter', credits: 3, price: 500 },
  { name: 'Regular', credits: 10, price: 1500 },
  { name: 'Pro', credits: 30, price: 3500 },
];

const AchatCreditsPage: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Fonction d'achat de crédits via PayDunya
  const handleBuyCredits = async (credits: number, packName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/paydunya-create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          type: 'pack',
          credits,
          packName,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }
      window.location.href = data.checkout_url;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erreur lors du paiement');
      } else {
        toast.error('Erreur lors du paiement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérification à l'arrivée sur la page
    const purchasePending = localStorage.getItem('credit_purchase_pending');
    if (purchasePending) {
      toast.success('Achat de crédits réussi !');
      localStorage.removeItem('credit_purchase_pending');
    }
  }, []);

  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-lg">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Acheter des crédits</h1>
          <p className="mb-8 text-grey-700">Choisissez un pack de crédits pour publier vos annonces sur DaloaMarket.</p>
          <div className="grid gap-6 mb-8">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.name} className="border rounded-xl p-6 flex flex-col items-center bg-grey-50 transition-shadow hover:shadow-lg">
                <div className="text-lg font-semibold mb-2">Pack {pack.name}</div>
                <div className="text-3xl font-bold text-primary mb-1">{pack.credits} crédits</div>
                <div className="text-xl font-medium mb-4">{pack.price} FCFA</div>
                <button
                  className="btn-primary w-full transition-transform transform hover:scale-105"
                  onClick={() => handleBuyCredits(pack.credits, pack.name)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Chargement...' : 'Acheter'}
                </button>
              </div>
            ))}
          </div>
          <button className="btn-outline w-full transition-transform transform hover:scale-105" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchatCreditsPage;