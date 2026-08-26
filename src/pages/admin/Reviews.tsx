import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Star, Phone } from 'lucide-react';

interface ReviewRow {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product_name?: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false });
    if (!data || data.length === 0) { setReviews([]); setLoading(false); return; }

    const productIds = [...new Set(data.map(r => r.product_id))];
    const { data: products } = await supabase.from('products').select('id, name').in('id', productIds);
    const nameById = new Map((products || []).map(p => [p.id, p.name]));

    setReviews(data.map(r => ({ ...r, product_name: nameById.get(r.product_id) || 'Unknown product' })));
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('product_reviews').update({ status }).eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">Product Reviews</h1>
      <p className="text-sm text-gray-400 mb-6">
        কাস্টমার review জমা দিলে এখানে আসে — approve করলেই সেটা প্রোডাক্ট পেজে দেখাবে। ফোন নম্বর দিয়ে Orders-এ verify করে নিন।
      </p>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${filter === f ? 'bg-charcoal text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-10">এই ক্যাটাগরিতে কোনো review নেই।</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-charcoal">{r.product_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{r.customer_name}</span>
                    <span className="flex items-center gap-1"><Phone size={12} />{r.customer_phone}</span>
                    <span>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <div className="flex text-gold flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < r.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>

              {r.comment && <p className="text-sm text-gray-700 mt-3 bg-gray-50 rounded-xl p-3">{r.comment}</p>}

              {filter === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStatus(r.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                    <Check size={15} /> Approve
                  </button>
                  <button onClick={() => setStatus(r.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                    <X size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
