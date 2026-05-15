import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

const JoditEditor = lazy(() => import('jodit-react'));

interface BlogPost {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  read_time: string;
  published: boolean;
  created_at: string;
}

const CATEGORIES = ['Guide', 'Product Review', 'Product Info', 'Skincare Tips', 'Tips & Tricks', 'Skincare', 'Ingredients', 'Seasonal', 'Trends'];

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Skincare',
    image: '',
    author: "Glamour's Touch",
    read_time: '5 min read',
    published: true
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please make sure you have a "products" bucket in your Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const postData = {
        title: formData.title,
        title_bn: formData.title_bn,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image: formData.image,
        author: formData.author,
        read_time: formData.read_time,
        published: formData.published
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blogs')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([postData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post. Make sure the "blogs" table exists in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !post.published })
        .eq('id', post.id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_bn: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Skincare',
      image: '',
      author: "Glamour's Touch",
      read_time: '5 min read',
      published: true
    });
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title_bn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Create and manage your blog content.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gold/20 hover:bg-charcoal transition-all"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search blog posts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Post</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                      Loading posts...
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No blog posts found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {post.image && (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{post.title_bn || post.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{post.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          post.published
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingPost(post);
                            setFormData({
                              title: post.title,
                              title_bn: post.title_bn || '',
                              slug: post.slug,
                              excerpt: post.excerpt || '',
                              content: post.content || '',
                              category: post.category,
                              image: post.image || '',
                              author: post.author,
                              read_time: post.read_time,
                              published: post.published
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-xl font-serif font-bold text-charcoal">
                  {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title (English) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title (English)</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="e.g. Korean Skincare Guide"
                    />
                  </div>

                  {/* Title (Bengali) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title (Bengali)</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title_bn}
                      onChange={(e) => setFormData({...formData, title_bn: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="e.g. কোরিয়ান স্কিনকেয়ার গাইড"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Slug (URL)</label>
                    <input 
                      required
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="e.g. korean-skincare-guide"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Auto-generated from English title</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Author</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="Author name"
                    />
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Read Time</label>
                    <input 
                      type="text" 
                      value={formData.read_time}
                      onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="e.g. 5 min read"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Excerpt (Short Description)</label>
                    <textarea 
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      placeholder="Brief summary of the blog post..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Featured Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="url" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm"
                            placeholder="Or paste an image URL..."
                          />
                        </div>
                        <div className="relative">
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group">
                            <Upload size={18} className={uploading ? "animate-bounce text-gold" : "text-gray-400 group-hover:text-gold"} />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-gold">
                              {uploading ? 'Uploading...' : 'Upload Image'}
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="relative aspect-video bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center group">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={() => setFormData({...formData, image: ''})}
                                className="p-2 bg-red-500 text-white rounded-full shadow-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImageIcon size={40} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-xs text-gray-400">Image Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content - JoditEditor */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Content (Rich Text)</label>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 min-h-[400px]">
                      <Suspense fallback={<div className="flex items-center justify-center h-[400px] text-gray-400 text-sm">Loading editor...</div>}>
                        <JoditEditor
                          value={formData.content}
                          onBlur={(newContent: string) => setFormData({...formData, content: newContent})}
                          config={{
                            readonly: false,
                            height: 400,
                            placeholder: 'Write your blog post content here...'
                          }}
                        />
                      </Suspense>
                    </div>
                  </div>

                  {/* Published Toggle */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.published}
                          onChange={(e) => setFormData({...formData, published: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gold transition-all" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Publish immediately</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-grow px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-grow px-6 py-4 bg-gold text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-charcoal transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlogPosts;
