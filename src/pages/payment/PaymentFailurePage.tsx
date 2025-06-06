import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="h-20 w-20 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-error" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-4">Échec du paiement</h1>
          
          <p className="mb-6">
            Le paiement n'a pas pu être validé. Aucun crédit n'a été débité.<br />
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/achat-credits')} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
            >
              Réessayer
            </button>
            
            <Link 
              to="/help" 
              className="btn-outline"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;