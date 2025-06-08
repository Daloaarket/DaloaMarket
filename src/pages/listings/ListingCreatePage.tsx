import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  CATEGORIES, 
  CONDITIONS, 
  DISTRICTS, 
  formatPrice 
} from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  district: string;
  boostOption: '' | '24h' | '7d' | '30d';
}

const BOOST_PRICES = {
  '24h': 300,
  '7d': 800,
  '30d': 2500,
};

const LISTING_FEE = 200;

const ListingCreatePage: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillListing: Listing | undefined = location.state as Listing | undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoErrors, setPhotoErrors] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [removedExistingPhotos, setRemovedExistingPhotos] = useState<number[]>([]);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isFirstListing, setIsFirstListing] = useState<boolean | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ListingFormData>();
  
  const boostOption = watch('boostOption', '');
  const boostPrice = boostOption ? BOOST_PRICES[boostOption] : 0;
  // Calcul du prix total à payer (hors crédits)
  // On ne facture les 200F que si l'utilisateur n'a pas de crédits ET ce n'est pas la première annonce
  const mustPayListingFee = !isFirstListing && (!userCredits || userCredits <= 0);
  const totalPrice = (mustPayListingFee ? LISTING_FEE : 0) + boostPrice;
  
  useEffect(() => {
    const verifyUser = async () => {
      if (!user?.id) {
        setIsCheckingUser(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setIsUserVerified(!!data);
      } catch (error) {
        console.error('Error verifying user:', error);
        setIsUserVerified(false);
      } finally {
        setIsCheckingUser(false);
      }
    };

    verifyUser();
  }, [user]);
  
  useEffect(() => {
    if (prefillListing && prefillListing.id) {
      // Pré-remplir le formulaire avec les données de l'annonce en attente
      reset({
        title: prefillListing.title,
        description: prefillListing.description,
        price: prefillListing.price,
        category: prefillListing.category,
        condition: prefillListing.condition,
        district: prefillListing.district,
        boostOption: prefillListing.boosted_until ? '' : '', // TODO: améliorer la gestion du boost si besoin
      });
      // Pré-remplir les photos dans l'état local pour la validation
      setPhotoFiles([]); // On ne pré-remplit PAS les File, on gère les URLs existantes séparément
      setRemovedExistingPhotos([]);
    }
  }, [prefillListing, reset]);

  // Ajout : suppression automatique des annonces en attente de paiement dupliquées
  useEffect(() => {
    const cleanPendingDuplicates = async () => {
      if (!user?.id || !prefillListing?.id) return;
      // Supprime toutes les autres annonces en attente de paiement avec le même titre, prix, catégorie, etc. sauf celle en cours
      const { data: pendings, error } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('title', prefillListing.title)
        .eq('price', prefillListing.price)
        .eq('category', prefillListing.category)
        .eq('condition', prefillListing.condition)
        .eq('district', prefillListing.district)
        .neq('id', prefillListing.id);
      if (!error && pendings && pendings.length > 0) {
        const idsToDelete = pendings.map(l => l.id);
        await supabase.from('listings').delete().in('id', idsToDelete);
      }
    };
    cleanPendingDuplicates();
  }, [user, prefillListing]);
  
  useEffect(() => {
    const checkFirstListing = async () => {
      if (!user?.id) {
        setIsFirstListing(null);
        return;
      }
      // On compte TOUTES les annonces créées par l'utilisateur (même supprimées ou archivées)
      const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) {
        setIsFirstListing(null);
        return;
      }
      setIsFirstListing(count === 0);
    };
    checkFirstListing();
  }, [user]);
  
  // Récupérer le solde de crédits à l'ouverture (contournement typage)
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) {
        setUserCredits(null);
        return;
      }
      // @ts-expect-error accès table custom
      const { data, error } = await (supabase as unknown)
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      if (error) {
        setUserCredits(null);
      } else {
        setUserCredits(data?.credits ?? 0);
      }
    };
    fetchCredits();
  }, [user]);
  
  // Fonction pour décrémenter le crédit (contournement typage)
  const decrementCredit = async () => {
    if (!user?.id) return false;
    // @ts-expect-error appel RPC custom
    const { error } = await (supabase as unknown).rpc('decrement_user_credit', { user_id_input: user.id });
    if (error) return false;
    setUserCredits((c) => (c !== null ? c - 1 : null));
    return true;
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(file => {
          if (file.errors[0].code === 'file-too-large') {
            return 'Image trop volumineuse (max 5MB)';
          }
          return file.errors[0].message;
        });
        setPhotoErrors(errors[0]);
        return;
      }
      
      if (acceptedFiles.length + photoFiles.length > 5) {
        setPhotoErrors('Maximum 5 photos autorisées');
        return;
      }
      
      setPhotoErrors(null);
      
      setPhotoFiles(prev => [...prev, ...acceptedFiles]);
    }
  });
  
  // Gestion suppression image existante
  const handleRemoveExistingPhoto = (index: number) => {
    setRemovedExistingPhotos((prev) => [...prev, index]);
  };
  // Gestion suppression image nouvelle
  const handleRemoveNewPhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const uploadPhotos = async (): Promise<string[]> => {
    // On conserve les anciennes photos non supprimées + les nouvelles uploadées
    let existingUrls: string[] = [];
    if (prefillListing && prefillListing.photos) {
      existingUrls = prefillListing.photos.filter((_, idx) => !removedExistingPhotos.includes(idx));
    }
    
    if (photoFiles.length === 0 && existingUrls.length === 0) {
      throw new Error('Veuillez ajouter au moins une photo');
    }
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user!.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
      return [...existingUrls, ...uploadedUrls];
    } catch (error) {
      console.error('Error uploading photos:', error);
      if (error instanceof Error) {
        throw new Error(error.message || "Erreur lors de l'upload des photos");
      } else {
        throw new Error("Erreur lors de l'upload des photos");
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const saveListing = async (formData: ListingFormData, photoUrls: string[]) => {
    if (!user?.id || !isUserVerified) {
      throw new Error("Votre compte n'est pas correctement configuré");
    }
    
    let boostedUntil = null;
    if (formData.boostOption) {
      const now = new Date();
      if (formData.boostOption === '24h') {
        now.setDate(now.getDate() + 1);
      } else if (formData.boostOption === '7d') {
        now.setDate(now.getDate() + 7);
      } else if (formData.boostOption === '30d') {
        now.setDate(now.getDate() + 30);
      }
      boostedUntil = now.toISOString();
    }
    
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        district: formData.district,
        photos: photoUrls,
        boosted_until: boostedUntil,
        status: 'pending' // <<--- ANNONCE EN ATTENTE PAIEMENT
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  };
  
  const processPayment = async (formData: ListingFormData, paymentType: 'annonce' | 'boost' | 'pack' = 'annonce', packInfo?: { credits: number, packName: string }) => {
    try {
      let listingId = prefillListing?.id;
      let photoUrls = prefillListing?.photos || [];
      // Si pas d'annonce existante, upload et création
      if (!listingId && paymentType !== 'pack') {
        photoUrls = await uploadPhotos();
        const listing = await saveListing(formData, photoUrls);
        listingId = listing.id;
      }
      // Préparation du body selon le type de paiement
      const body: Record<string, unknown> = {
        userId: user?.id,
        type: paymentType,
      };
      if (paymentType === 'annonce' || paymentType === 'boost') {
        body.annonceId = listingId;
        if (paymentType === 'boost') {
          body.boostOption = formData.boostOption;
        }
      } else if (paymentType === 'pack' && packInfo) {
        body.credits = packInfo.credits;
        body.packName = packInfo.packName;
      }
      
      // Appel à la nouvelle fonction PayDunya
      const response = await fetch('/.netlify/functions/paydunya-create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }
      
      // Rediriger vers PayDunya
      window.location.href = data.checkout_url;
      
    } catch (error) {
      console.error('Payment processing error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erreur lors du traitement du paiement');
      } else {
        toast.error('Erreur lors du traitement du paiement');
      }
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: ListingFormData) => {
    // Validation stricte : au moins une image (ancienne non supprimée OU nouvelle)
    const existingCount = prefillListing && prefillListing.photos ? prefillListing.photos.length - removedExistingPhotos.length : 0;
    if (existingCount + photoFiles.length === 0) {
      setPhotoErrors('Veuillez ajouter au moins une photo');
      return;
    }
    setPhotoErrors(null);
    setIsLoading(true);

    // Cas 1 : Boost => paiement direct (inchangé)
    if (data.boostOption) {
      await processPayment(data, 'boost');
      return;
    }

    // Cas 2 : Première annonce gratuite
    if (isFirstListing) {
      try {
        let listingId = prefillListing?.id;
        let photoUrls = prefillListing?.photos || [];
        if (!listingId) {
          photoUrls = await uploadPhotos();
          const listing = await saveListing(data, photoUrls);
          listingId = listing.id;
        }
        await supabase.from('listings').update({ status: 'active' }).eq('id', listingId);
        toast.success('Votre première annonce a été publiée gratuitement !');
        navigate(`/listings/${listingId}`);
      } catch {
        toast.error("Erreur lors de la publication de l'annonce");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Cas 3 : Utilisateur a des crédits
    if (userCredits && userCredits > 0) {
      try {
        let listingId = prefillListing?.id;
        let photoUrls = prefillListing?.photos || [];
        if (!listingId) {
          photoUrls = await uploadPhotos();
          const listing = await saveListing(data, photoUrls);
          listingId = listing.id;
        }
        const decremented = await decrementCredit();
        if (!decremented) {
          toast.error('Erreur lors de la consommation du crédit.');
          setIsLoading(false);
          return;
        }
        await supabase.from('listings').update({ status: 'active' }).eq('id', listingId);
        toast.success('Annonce publiée ! 1 crédit consommé.');
        navigate(`/listings/${listingId}`);
      } catch {
        toast.error("Erreur lors de la publication de l'annonce");
        setIsLoading(false);
      }
      return;
    }

    // Cas 4 : Pas de crédits => paiement à l'unité (200F)
    await processPayment(data, 'annonce');
  };
  
  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isUserVerified) {
    return (
      <div className="min-h-screen bg-grey-50 py-8">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-card shadow-card p-6 md:p-8 text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Compte non configuré</h1>
            <p className="text-grey-600 mb-6">
              Votre compte n'est pas correctement configuré. Veuillez vous reconnecter pour résoudre ce problème.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl p-0 overflow-hidden border border-primary-100">
          {/* Header visuel */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-extrabold text-white drop-shadow mb-2 sm:mb-0">Publier une annonce</h1>
            {user && (
              <div className="flex items-center gap-4">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full font-semibold text-lg shadow">Crédits : <span className="font-bold">{userCredits === null ? '...' : userCredits}</span></span>
                <button
                  type="button"
                  className="btn-outline border-white text-white hover:bg-white/10 hover:text-white"
                  onClick={() => navigate('/acheter-credits')}
                >
                  Acheter des crédits
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 px-8 py-10">
            {/* Photos */}
            <div>
              <label className="input-label text-lg font-semibold mb-2 block">Photos <span className="text-grey-500 font-normal">(max 5)</span></label>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors bg-grey-50 hover:bg-primary-50/40 ${photoErrors ? 'border-error-500 bg-error-50' : 'border-primary-200'}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-grey-700 text-lg font-medium">Glissez-déposez vos photos ici, ou cliquez pour sélectionner</p>
                <p className="text-sm text-grey-500 mt-1">Formats acceptés : JPG, PNG, WEBP (max 5MB)</p>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Images déjà présentes dans l'annonce (prefillListing.photos) */}
                {prefillListing && prefillListing.photos && prefillListing.photos.map((photo, index) => (
                  removedExistingPhotos.includes(index) ? null : (
                    <div key={"existing-"+index} className="relative aspect-square rounded-xl overflow-hidden group shadow border border-grey-200">
                      <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveExistingPhoto(index)}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-error-500 hover:text-white text-error-500 rounded-full p-1 shadow transition-colors z-10 group-hover:opacity-100 opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )
                ))}
                {/* Images nouvellement ajoutées (photoFiles) */}
                {photoFiles.map((file, index) => (
                  <div key={"new-"+index} className="relative aspect-square rounded-xl overflow-hidden group shadow border border-primary-200">
                    <img src={URL.createObjectURL(file)} alt={`Preview ajoutée ${index + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveNewPhoto(index)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-error-500 hover:text-white text-error-500 rounded-full p-1 shadow transition-colors z-10 group-hover:opacity-100 opacity-80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              {photoErrors && (
                <p className="input-error flex items-center mt-2 text-lg">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {photoErrors}
                </p>
              )}
            </div>
            
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="title" className="input-label text-lg font-semibold mb-2 block">Titre de l'annonce</label>
                <input
                  id="title"
                  type="text"
                  className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm ${errors.title ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="Ex: Manette PS4 en très bon état"
                  {...register('title', { 
                    required: 'Le titre est requis',
                    minLength: {
                      value: 5,
                      message: 'Le titre doit contenir au moins 5 caractères'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Le titre ne doit pas dépasser 100 caractères'
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="input-error flex items-center mt-2 text-base">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {errors.title.message}
                  </p>
                )}
              </div>
              {/* Price */}
              <div>
                <label htmlFor="price" className="input-label text-lg font-semibold mb-2 block">Prix (FCFA)</label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm pr-20 ${errors.price ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                    placeholder="Ex: 15000"
                    {...register('price', { 
                      required: 'Le prix est requis',
                      min: {
                        value: 200,
                        message: 'Le prix minimum est de 200 FCFA'
                      },
                      max: {
                        value: 10000000,
                        message: 'Le prix maximum est de 10 000 000 FCFA'
                      }
                    })}
                    disabled={isLoading}
                  />
                  <span className="absolute right-4 top-3 text-grey-500 font-bold text-lg">FCFA</span>
                </div>
                {errors.price && (
                  <p className="input-error flex items-center mt-2 text-base">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="input-label text-lg font-semibold mb-2 block">Description</label>
              <textarea
                id="description"
                rows={5}
                className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm ${errors.description ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                placeholder="Décrivez votre article en détail (état, caractéristiques, raison de la vente...)"
                {...register('description', { 
                  required: 'La description est requise',
                  minLength: {
                    value: 20,
                    message: 'La description doit contenir au moins 20 caractères'
                  }
                })}
                disabled={isLoading}
              ></textarea>
              {errors.description && (
                <p className="input-error flex items-center mt-2 text-base">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {errors.description.message}
                </p>
              )}
            </div>
            
            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="category" className="input-label text-lg font-semibold mb-2 block">Catégorie</label>
                <select
                  id="category"
                  className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm ${errors.category ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('category', { 
                    required: 'La catégorie est requise'
                  })}
                  disabled={isLoading}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="input-error flex items-center mt-2 text-base">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="condition" className="input-label text-lg font-semibold mb-2 block">État</label>
                <select
                  id="condition"
                  className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm ${errors.condition ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('condition', { 
                    required: 'L\'état est requis'
                  })}
                  disabled={isLoading}
                >
                  <option value="">Sélectionnez l'état</option>
                  {CONDITIONS.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="input-error flex items-center mt-2 text-base">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {errors.condition.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* District */}
            <div>
              <label htmlFor="district" className="input-label text-lg font-semibold mb-2 block">Quartier à Daloa</label>
              <select
                id="district"
                className={`input-field text-lg px-5 py-3 rounded-xl shadow-sm ${errors.district ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                {...register('district', { 
                  required: 'Le quartier est requis'
                })}
                disabled={isLoading}
              >
                <option value="">Sélectionnez votre quartier</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="input-error flex items-center mt-2 text-base">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {errors.district.message}
                </p>
              )}
            </div>
            
            {/* Boost Options */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-primary">Options de boost</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="boost-none"
                    value=""
                    className="h-5 w-5 text-primary focus:ring-primary-500"
                    {...register('boostOption')}
                    disabled={isLoading}
                  />
                  <label htmlFor="boost-none" className="ml-3 block text-grey-800 text-lg font-medium">
                    Aucun boost
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="boost-24h"
                    value="24h"
                    className="h-5 w-5 text-primary focus:ring-primary-500"
                    {...register('boostOption')}
                    disabled={isLoading}
                  />
                  <label htmlFor="boost-24h" className="ml-3 block text-grey-800 text-lg font-medium">
                    Boost 24h <span className="font-semibold">{formatPrice(BOOST_PRICES['24h'])}</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="boost-7d"
                    value="7d"
                    className="h-5 w-5 text-primary focus:ring-primary-500"
                    {...register('boostOption')}
                    disabled={isLoading}
                  />
                  <label htmlFor="boost-7d" className="ml-3 block text-grey-800 text-lg font-medium">
                    Boost 7 jours <span className="font-semibold">{formatPrice(BOOST_PRICES['7d'])}</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="boost-30d"
                    value="30d"
                    className="h-5 w-5 text-primary focus:ring-primary-500"
                    {...register('boostOption')}
                    disabled={isLoading}
                  />
                  <label htmlFor="boost-30d" className="ml-3 block text-grey-800 text-lg font-medium">
                    Boost 30 jours <span className="font-semibold">{formatPrice(BOOST_PRICES['30d'])}</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 text-base text-grey-700 flex items-start gap-2 bg-white/60 rounded-lg p-4 border border-primary-100">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Les annonces boostées apparaissent en haut des résultats de recherche et sont marquées comme "Sponsorisées".
                </span>
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-primary">Récapitulatif</h3>
              <div className="space-y-4">
                {mustPayListingFee && (
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-grey-700">Frais de publication</span>
                    <span className="font-semibold">{formatPrice(LISTING_FEE)}</span>
                  </div>
                )}
                {boostOption && (
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-grey-700">Boost {boostOption}</span>
                    <span className="font-semibold">{formatPrice(boostPrice)}</span>
                  </div>
                )}
                <div className="border-t border-grey-200 pt-4 mt-4 flex justify-between items-center text-xl">
                  <span className="font-bold text-grey-900">Total</span>
                  <span className="font-extrabold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <div className="mt-6 text-base text-grey-700 flex items-start gap-2 bg-white/60 rounded-lg p-4 border border-primary-100">
                <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Paiement sécurisé via PayDunya (Orange Money, MTN Mobile Money).</span>
              </div>
            </div>
            
            {/* Terms */}
            <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-xl p-6 border border-primary-200 shadow-sm mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                <p className="text-base text-grey-800">
                  En publiant cette annonce, vous acceptez les
                  <a
                    href="/terms"
                    className="text-primary font-semibold underline hover:text-primary-700 transition ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    conditions d'utilisation
                  </a>
                  de DaloaMarket et confirmez que votre article est conforme à nos règles.
                </p>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={isLoading || isUploading || isFirstListing === null}
            >
              {isLoading ? (
                <LoadingSpinner size="small\" className="text-white" />
              ) : (
                prefillListing && prefillListing.id ? 'Payer et publier' : 'Publier et payer'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListingCreatePage;