import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSupabase } from '../hooks/useSupabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CREDIT_PACKS = [
  { name: 'Starter', credits: 3, price: 500 },
  { name: 'Regular', credits: 10, price: 1500 },
  { name: 'Pro', credits: 30, price: 3500 },
];

const AchatCreditsPage: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  // Fonction d'achat de crédits via PayDunya
  const handleBuyCredits = async (credits: number, packName: string) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour acheter des crédits');
      return;
    }

    setIsLoading(true);
    setLoadingPackId(packName);
    
    try {
      console.log('Envoi requête achat crédits:', { credits, packName, userId: user.id });
      
      const response = await fetch('/.netlify/functions/paydunya-create-invoice', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          type: 'pack',
          credits,
          packName,
        }),
      });

      console.log('Statut réponse:', response.status);
      console.log('Headers réponse:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('Réponse brute:', responseText);
        
        if (!responseText) {
          throw new Error('Réponse vide du serveur');
        }
        
        data = JSON.parse(responseText);
        console.log('Données parsées:', data);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        throw new Error('Réponse invalide du serveur');
      }

      if (!data.success || !data.checkout_url) {
        throw new Error(data.error || 'URL de paiement manquante');
      }

      console.log('Redirection vers PayDunya:', data.checkout_url);
      window.location.href = data.checkout_url;
      
    } catch (error) {
      console.error('Erreur achat crédits:', error);
      
      if (error instanceof Error) {
        toast.error(error.message || 'Erreur lors du paiement');
      } else {
        toast.error('Erreur lors du paiement');
      }
    } finally {
      setIsLoading(false);
      setLoadingPackId(null);
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
                  className="btn-primary w-full transition-transform transform hover:scale-105 flex items-center justify-center"
                  onClick={() => handleBuyCredits(pack.credits, pack.name)}
                  disabled={isLoading}
                >
                  {loadingPackId === pack.name ? (
                    <>
                      <LoadingSpinner size="small" className="text-white mr-2" />
                      Traitement...
                    </>
                  ) : (
                    'Acheter'
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <button 
            className="btn-outline w-full transition-transform transform hover:scale-105" 
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Retour
          </button>
          
          {/* Informations de paiement */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg text-left">
            <h3 className="font-semibold text-primary-800 mb-2">💳 Moyens de paiement</h3>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• Orange Money</li>
              <li>• MTN Mobile Money</li>
              <li>• Cartes bancaires</li>
            </ul>
            <p className="text-xs text-primary-600 mt-2">
              Paiement sécurisé via PayDunya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchatCreditsPage;