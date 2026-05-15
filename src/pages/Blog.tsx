import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_bn: string;
  excerpt: string;
  date: string;
  read_time: string;
  category: string;
  image: string;
  content: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Skincare Knowledge</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-4 leading-tight">
            Beauty <span className="text-gold italic">Blog</span>
          </h1>
          <p className="text-lg font-light text-gray-500 max-w-2xl mx-auto mb-8">কোনো Article এখনও যোগ করা হয়নি। খুব শীঘ্রই আসছে!</p>
        </div>
      </div>
    );
  }

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <>
      <SEO
        title="Skincare Blog — Korean Beauty Tips Bangla"
        description="Korean skincare tips, product reviews এবং beauty guide বাংলায়। DABO, Rice Ceramide, Glutathione সহ সব Korean beauty products সম্পর্কে জানুন। glamourstouch.com"
        url="/blog"
      />

      <div className="min-h-screen bg-cream pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Skincare Knowledge</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-4 leading-tight">
              Beauty <span className="text-gold italic">Blog</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl mx-auto">
              Korean skincare tips, product guides এবং beauty secrets — সব বাংলায়
            </p>
          </motion.div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500">
                <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title_bn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="bg-white p-10 flex flex-col justify-center">
                  <span className="inline-block bg-gold/10 text-gold text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 w-fit">
                    {featuredPost.category} — Featured
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-charcoal mb-4 group-hover:text-gold transition-colors leading-tight">
                    {featuredPost.title_bn}
                  </h2>
                  <p className="text-gray-500 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={12} /> {featuredPost.read_time} read
                    </span>
                    <span className="flex items-center gap-1 text-gold font-bold text-sm group-hover:gap-2 transition-all">
                      পড়ুন <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Post Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {remainingPosts.map((post, idx) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08, duration: 0.5 }}
              >
                <Link to={`/blog/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title_bn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="text-base font-serif font-bold text-charcoal mt-3 mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-2">
                      {post.title_bn}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} /> {post.read_time}
                      </span>
                      <span className="text-[10px] font-bold text-gold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        পড়ুন <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mt-16 bg-charcoal rounded-3xl p-10 text-center text-white"
          >
            <BookOpen size={40} className="mx-auto mb-4 text-gold" />
            <h2 className="text-3xl font-serif font-bold mb-3">Product দেখতে চান?</h2>
            <p className="text-gray-400 mb-6">সব Korean skincare products এক জায়গায় — 100% authentic</p>
            <Link to="/shop"
              className="inline-flex items-center gap-2 bg-gold hover:bg-white hover:text-charcoal text-white px-8 py-4 rounded-full font-bold tracking-widest text-xs uppercase transition-all">
              SHOP NOW <ArrowRight size={14} />
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default Blog;
