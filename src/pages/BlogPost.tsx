import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, ArrowLeft, ArrowRight, Phone, MessageCircle } from 'lucide-react';
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
  created_at: string;
}

// Very lightweight markdown renderer
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-serif font-bold text-charcoal mt-8 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-serif font-bold text-charcoal mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-gold bg-gold/5 px-6 py-4 rounded-r-xl my-4 italic text-gray-600">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('❌ ') || line.startsWith('✨ ') || line.startsWith('📞') || line.startsWith('💬') || line.startsWith('🌐')) {
      // collect list items
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('✅ ') || lines[i].startsWith('❌ ') || lines[i].startsWith('✨ ') || lines[i].startsWith('📞') || lines[i].startsWith('💬') || lines[i].startsWith('🌐'))) {
        items.push(lines[i]);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-gray-600">
              <span className="text-gold mt-0.5 flex-shrink-0">
                {item.startsWith('- ') ? '•' : item.split(' ')[0]}
              </span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item.startsWith('- ') ? item.slice(2) : item.slice(item.indexOf(' ') + 1)) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith('| ') && line.includes('|')) {
      // Table — skip separator row
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].includes('---')) tableLines.push(lines[i]);
        i++;
      }
      const [header, ...rows] = tableLines;
      const headers = header.split('|').map(h => h.trim()).filter(Boolean);
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gold/10">
                {headers.map((h, j) => <th key={j} className="text-left px-4 py-2 font-bold text-charcoal border border-gold/20">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => {
                const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                return (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-cream/50'}>
                    {cells.map((cell, cIdx) => <td key={cIdx} className="px-4 py-2 text-gray-600 border border-gold/10" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      elements.push(
        <p key={i} className="font-bold text-charcoal mt-4 mb-1">{line.slice(2, -2)}</p>
      );
    } else if (line.trim() === '') {
      // skip empty lines
    } else if (line.trim()) {
      elements.push(
        <p key={i} className="text-gray-600 leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
    i++;
  }
  return elements;
};

const formatInline = (text: string) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-charcoal">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gold/10 text-charcoal px-1 rounded text-sm">$1</code>');

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchPost(slug);
  }, [slug]);

  const fetchPost = async (currentSlug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts = data || [];
      const currentPost = posts.find((p: BlogPost) => p.slug === currentSlug);

      if (!currentPost) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const currentIdx = posts.findIndex((p: BlogPost) => p.id === currentPost.id);
      setPost(currentPost);
      setPrevPost(currentIdx > 0 ? posts[currentIdx - 1] : null);
      setNextPost(currentIdx < posts.length - 1 ? posts[currentIdx + 1] : null);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
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

  if (notFound || !post) return <Navigate to="/blog" replace />;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.image}
        url={`/blog/${post.slug}`}
        type="article"
      />

      <div className="min-h-screen bg-cream pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mb-8">
              <ArrowLeft size={14} /> সব Article
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-gold/10 text-gold text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-charcoal mb-4 leading-tight">
              {post.title_bn}
            </h1>
            <p className="text-gray-500 text-lg mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-8 pb-8 border-b border-gold/10">
              <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time} read</span>
              <span>{new Date(post.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-lg">
            <img src={post.image} alt={post.title_bn} className="w-full h-full object-cover" />
          </motion.div>

          {/* Content */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="prose-custom" lang="bn">
            {renderContent(post.content)}
          </motion.article>

          {/* CTA Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mt-12 bg-charcoal rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-serif font-bold mb-2">Order করতে চান?</h3>
            <p className="text-gray-400 mb-6 text-sm">100% authentic Korean skincare — fast delivery সারা Bangladesh এ</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/8801712426871?text=Hi! I want to order Korean skincare"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25d366] text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                <MessageCircle size={16} /> WhatsApp Order
              </a>
              <Link to="/shop"
                className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white hover:text-charcoal transition-all">
                Shop করুন <ArrowRight size={16} />
              </Link>
              <a href="tel:+8801712426871"
                className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-colors">
                <Phone size={16} /> 01712-426871
              </a>
            </div>
          </motion.div>

          {/* Prev / Next */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`}
                className="group col-start-1 bg-white rounded-2xl p-5 hover:shadow-md transition-shadow border border-gold/10">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-2"><ArrowLeft size={10} /> আগের post</span>
                <p className="text-sm font-serif font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">{prevPost.title_bn}</p>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`}
                className="group col-start-2 bg-white rounded-2xl p-5 hover:shadow-md transition-shadow border border-gold/10 text-right">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 justify-end mb-2">পরের post <ArrowRight size={10} /></span>
                <p className="text-sm font-serif font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">{nextPost.title_bn}</p>
              </Link>
            ) : <div />}
          </div>

        </div>
      </div>
    </>
  );
};

export default BlogPost;
