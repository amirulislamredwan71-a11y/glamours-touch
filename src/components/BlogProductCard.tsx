import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { optimizeImageUrl } from '../lib/imageUtils';

export interface BlogProductCardProps {
  title: string;
  price: number;
  regularPrice?: number;
  discountPercent?: string;
  imageUrl: string;
  productSlug: string;
  badge?: string;
  subtitle?: string;
}

export const BlogProductCard: React.FC<BlogProductCardProps> = ({
  title,
  price,
  regularPrice,
  discountPercent,
  imageUrl,
  productSlug,
  badge = '100% Authentic Korean',
  subtitle,
}) => {
  const calcDiscount = regularPrice && regularPrice > price
    ? `${Math.round(((regularPrice - price) / regularPrice) * 100)}% OFF`
    : discountPercent;

  return (
    <div className="my-8 bg-gradient-to-br from-white to-cream/40 border border-gold/30 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Product Image */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 bg-white rounded-xl border border-gray-100 p-2 overflow-hidden shadow-inner flex items-center justify-center">
          <img
            src={optimizeImageUrl(imageUrl, 300)}
            alt={title}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {badge && (
            <span className="absolute top-2 left-2 bg-charcoal/90 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {badge}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Original
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Truck className="w-3.5 h-3.5" />
              Cash on Delivery
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-serif font-bold text-charcoal line-clamp-2 hover:text-gold transition-colors">
            <Link to={productSlug.startsWith('/') ? productSlug : `/product/${productSlug}`}>
              {title}
            </Link>
          </h4>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{subtitle}</p>
          )}

          {/* Pricing */}
          <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
            <span className="text-xl sm:text-2xl font-bold text-charcoal">
              ৳{price.toLocaleString()}
            </span>
            {regularPrice && regularPrice > price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
            {calcDiscount && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                {calcDiscount}
              </span>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
            <Link
              to={productSlug.startsWith('/') ? productSlug : `/product/${productSlug}`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-charcoal font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              অর্ডার করুন / Buy Now
            </Link>
            <Link
              to={productSlug.startsWith('/') ? productSlug : `/product/${productSlug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gold transition-colors"
            >
              বিস্তারিত দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogProductCard;
