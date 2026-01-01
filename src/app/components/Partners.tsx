import { useState, useRef } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { partners, Partner } from '../data/partners';
import { Card } from './Card';

interface PartnersProps {
  variant?: 'full' | 'compact';
}

export function Partners({ variant = 'full' }: PartnersProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
        <p className="text-xs text-gray-500 mb-3 font-medium">TRUSTED BY</p>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {partners.slice(0, 4).map((partner) => (
            <div
              key={partner.id}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span className="text-2xl">{partner.logo}</span>
            </div>
          ))}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-600">+{partners.length - 4}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Our Partners</h2>
        <p className="text-sm text-gray-600">Trusted brands making bulk savings possible</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6" ref={scrollContainerRef}>
        {partners.map((partner) => (
          <button
            key={partner.id}
            onClick={() => setSelectedPartner(partner)}
            className="flex-shrink-0 group active:scale-95 transition-transform"
          >
            <div className="w-32 h-40 bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center border border-purple-100 shadow-sm">
                <span className="text-4xl">{partner.logo}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 text-center leading-tight line-clamp-2 mb-1">
                {partner.name}
              </p>
              <p className="text-[10px] text-gray-500 text-center font-medium uppercase tracking-wide">
                {partner.category}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Arrows - Desktop only, below the carousel */}
      <div className="hidden md:flex items-center justify-center gap-3 mt-2">
        <button
          onClick={() => scroll('left')}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Previous partners"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Next partners"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Partner Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedPartner(null)}
          ></div>
          
          <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl p-6 animate-slide-up">
            <button
              onClick={() => setSelectedPartner(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-gray-200 shadow-lg flex-shrink-0">
                <span className="text-5xl">{selectedPartner.logo}</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedPartner.name}</h3>
                <p className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                  {selectedPartner.category}
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {selectedPartner.description}
            </p>

            <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-xl">{selectedPartner.logo}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium">Exclusive Partnership</p>
                <p className="text-sm font-bold text-gray-900">Special Bulk Pricing</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}