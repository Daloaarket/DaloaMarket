import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Clock, 
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SearchBar from '../../components/search/SearchBar';
import ListingCard from '../../components/listings/ListingCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  CATEGORIES, 
  CONDITIONS, 
  DISTRICTS, 
  formatPrice 
} from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingWithSeller = Listing & { seller_name: string; seller_rating: number | null };

interface FilterState {
  category: string;
  condition: string;
  district: string;
  minPrice: string;
  maxPrice: string;
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    category: queryParams.get('category') || '',
    condition: queryParams.get('condition') || '',
    district: queryParams.get('district') || '',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
  });
  
  const searchQuery = queryParams.get('q') || '';
  const ITEMS_PER_PAGE = 12;
  
  useEffect(() => {
    // Update filters when URL params change
    setFilters({
      category: queryParams.get('category') || '',
      condition: queryParams.get('condition') || '',
      district: queryParams.get('district') || '',
      minPrice: queryParams.get('minPrice') || '',
      maxPrice: queryParams.get('maxPrice') || '',
    });
    
    // Reset to page 1 when filters change
    setPage(1);
    
    fetchListings(1);
  }, [location.search, sortBy, sortOrder]);
  
  const fetchListings = async (pageNumber: number) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            full_name,
            rating
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply search query if provided
      if (searchQuery) {
        query = query.textSearch('title', searchQuery, {
          type: 'websearch',
          config: 'english'
        });
      }
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice));
      }
      
      // Pagination
      const from = (pageNumber - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const formattedListings = data.map(item => ({
        ...item,
        seller_name: item.users?.full_name || 'Utilisateur',
        seller_rating: item.users?.rating || null
      }));
      
      if (pageNumber === 1) {
        setListings(formattedListings);
      } else {
        setListings(prev => [...prev, ...formattedListings]);
      }
      
      if (count !== null) {
        setTotalCount(count);
        setHasMore(from + formattedListings.length < count);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(nextPage);
  };
  
  const handleSortChange = (value: string) => {
    if (value === 'price_asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price_desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else {
      setSortBy('created_at');
      setSortOrder('desc');
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    }
    
    if (filters.condition) {
      params.set('condition', filters.condition);
    }
    
    if (filters.district) {
      params.set('district', filters.district);
    }
    
    if (filters.minPrice) {
      params.set('minPrice', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      params.set('maxPrice', filters.maxPrice);
    }
    
    navigate(`/search?${params.toString()}`);
    setIsFilterOpen(false);
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      district: '',
      minPrice: '',
      maxPrice: '',
    });
    
    if (searchQuery) {
      navigate(`/search?q=${searchQuery}`);
    } else {
      navigate('/search');
    }
    
    setIsFilterOpen(false);
  };
  
  const getCategoryLabel = (id: string) => {
    const category = CATEGORIES.find(c => c.id === id);
    return category ? category.label : '';
  };
  
  const getConditionLabel = (id: string) => {
    const condition = CONDITIONS.find(c => c.id === id);
    return condition ? condition.label : '';
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar initialQuery={searchQuery} />
        </div>
        
        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="btn-outline flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            
            {/* Active Filters */}
            {(filters.category || filters.condition || filters.district || filters.minPrice || filters.maxPrice) && (
              <div className="ml-4 flex flex-wrap gap-2">
                {filters.category && (
                  <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {getCategoryLabel(filters.category)}
                    <button 
                      onClick={() => {
                        const newFilters = { ...filters, category: '' };
                        setFilters(newFilters);
                        
                        const params = new URLSearchParams(location.search);
                        params.delete('category');
                        navigate(`/search?${params.toString()}`);
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {filters.condition && (
                  <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {getConditionLabel(filters.condition)}
                    <button 
                      onClick={() => {
                        const newFilters = { ...filters, condition: '' };
                        setFilters(newFilters);
                        
                        const params = new URLSearchParams(location.search);
                        params.delete('condition');
                        navigate(`/search?${params.toString()}`);
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {filters.district && (
                  <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {filters.district}
                    <button 
                      onClick={() => {
                        const newFilters = { ...filters, district: '' };
                        setFilters(newFilters);
                        
                        const params = new URLSearchParams(location.search);
                        params.delete('district');
                        navigate(`/search?${params.toString()}`);
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {(filters.minPrice || filters.maxPrice) && (
                  <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                    Prix: {filters.minPrice ? formatPrice(parseInt(filters.minPrice)) : '0'} 
                    {' - '} 
                    {filters.maxPrice ? formatPrice(parseInt(filters.maxPrice)) : '∞'}
                    <button 
                      onClick={() => {
                        const newFilters = { ...filters, minPrice: '', maxPrice: '' };
                        setFilters(newFilters);
                        
                        const params = new URLSearchParams(location.search);
                        params.delete('minPrice');
                        params.delete('maxPrice');
                        navigate(`/search?${params.toString()}`);
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={resetFilters}
                  className="text-grey-600 text-sm hover:text-grey-900 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-grey-600 mr-2">Trier par:</span>
            <select
              className="input-field py-2"
              value={sortBy === 'created_at' ? 'newest' : sortBy === 'price' && sortOrder === 'asc' ? 'price_asc' : 'price_desc'}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-grey-600">
            {totalCount} résultat{totalCount !== 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
        </div>
        
        {/* Listings Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  sellerName={listing.seller_name}
                  sellerRating={listing.seller_rating}
                />
              ))}
            </div>
            
            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="btn-outline flex items-center mx-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small\" className="mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Charger plus d'annonces
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-card shadow-card p-8 text-center">
            <AlertCircle className="h-16 w-16 text-grey-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
            <p className="text-grey-600 mb-6">
              Aucune annonce ne correspond à votre recherche. Essayez de modifier vos filtres ou votre recherche.
            </p>
            <button
              onClick={resetFilters}
              className="btn-primary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
      
      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card shadow-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filtres</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-grey-500 hover:text-grey-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="input-label">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  className="input-field"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Toutes les catégories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="condition" className="input-label">
                  État
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="input-field"
                  value={filters.condition}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les états</option>
                  {CONDITIONS.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="district" className="input-label">
                  Quartier
                </label>
                <select
                  id="district"
                  name="district"
                  className="input-field"
                  value={filters.district}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les quartiers</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="input-label">Prix (FCFA)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      className="input-field"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      className="input-field"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={resetFilters}
                className="btn-outline"
              >
                Réinitialiser
              </button>
              
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;