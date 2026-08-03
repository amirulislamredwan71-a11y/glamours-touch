import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, Link as LinkIcon } from 'lucide-react';

interface Banner { id: string; image: string; link: string | null; title: string | null; active: boolean; sort: number; }

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_banners').select('*').order('sort', { ascending: true });
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchBanners(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `promo-banners/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      const { error: insErr } = await supabase.from('promo_banners')
        .insert([{ image: publicUrl, link: link || null, title: title || null, active: true, sort: banners.length }]);
      if (insErr) throw insErr;
      setLink(''); setTitle(''); fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Upload failed. Make sure the "promo_banners" table and "products" storage bucket exist.');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from('promo_banners').update({ active: !b.active }).eq('id', b.id);
    fetchBanners();
  };
  const remove = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    await supabase.from('promo_banners').delete().eq('id', id);
    fetchBanners();
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">Flash Sale Banners</h1>
      <p className="text-sm text-gray-400 mb-6">যেকোনো সময় post-card image আপলোড করুন — Home page-এ carousel হিসেবে দেখাবে।</p>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold" />
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link e.g. /shop?category=Sale (optional)"
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold" />
        </div>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-gold/5 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/10 transition-all text-gold font-bold">
          <Upload size={18} className={uploading ? 'animate-bounce' : ''} />
          {uploading ? 'Uploading...' : 'Upload Banner Image'}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
        <p className="text-[11px] text-gray-400 mt-2">টিপ: wide/landscape post-card (16:5 অনুপাত) সবচেয়ে সুন্দর দেখাবে।</p>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="text-gray-400 text-center py-10">কোনো banner নেই। উপরে থেকে একটা আপলোড করুন।</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-[16/7] bg-gray-100"><img src={b.image} alt="" className="w-full h-full object-cover" /></div>
              <div className="p-4">
                {b.title && <p className="font-bold text-sm text-charcoal mb-1 truncate">{b.title}</p>}
                {b.link && <p className="text-xs text-gray-400 mb-3 truncate flex items-center gap-1"><LinkIcon size={11} />{b.link}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(b)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${b.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {b.active ? 'Active ✓ (দেখাচ্ছে)' : 'Hidden'}
                  </button>
                  <button onClick={() => remove(b.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Banners;
