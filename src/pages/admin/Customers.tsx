import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  updated_at: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-charcoal">Customers</h1>
        <p className="text-gray-500 mt-1">View and manage your registered customer base.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && customers.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gold/10">
                  {customer.avatar_url ? (
                    <img src={customer.avatar_url} alt={customer.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gold bg-gold/5">
                      {customer.display_name?.[0] || customer.email?.[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{customer.display_name || 'Anonymous'}</h3>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {new Date(customer.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all">
                View Profile
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
