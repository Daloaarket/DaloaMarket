import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const listingId = queryParams.get('listing_id');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  useEffect(() => {
    const updateTransactionStatus = async () => {
      if (!listingId) {
        setLoading(false);
        return;
      }
      
      try {
        // Get the transaction for this listing
        const { data: transactions, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('listing_id', listingId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (fetchError || !transactions || transactions.length === 0) {
          setLoading(false);
          return;
        }
        
        const transaction = transactions[0];
        setTransactionId(transaction.id);
        
        // On ne vérifie pas le statut PayDunya côté client (pas d'appel API direct)
        // On suppose que le callback PayDunya publie l'annonce automatiquement
      } catch (error) {
        console.error('Error updating transaction:', error);
      } finally {
        setLoading(false);
      }
    };
    
    updateTransactionStatus();
  }, [listingId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="h-20 w-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Paiement réussi !</h1>
          
          <p className="text-grey-600 mb-6">
            Votre paiement a été traité avec succès et votre annonce est maintenant publiée sur DaloaMarket.
          </p>
          
          {transactionId && (
            <p className="text-sm text-grey-500 mb-6">
              Référence de transaction: {transactionId}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {listingId && (
              <Link 
                to={`/listings/${listingId}`} 
                className="btn-primary"
              >
                Voir mon annonce
              </Link>
            )}
            
            <button 
              onClick={() => navigate('/')} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;