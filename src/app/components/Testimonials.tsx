import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from './Card';

interface Testimonial {
  id: number;
  name: string;
  year: number;
  quote: string;
  savings: string;
  avatar: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Motunrayo",
    year: 2023,
    quote: "I join Detty December since 2023 when I was in Benue state, someone posted the link then I join with faith. The first year my package was sent to my mom she snap what she received to me I never expect such kind of plenty food I thought you won't be able to deliver but you convinced me with your accountability kudos to you ma’am... people that joined through me never regret joining too we looking forward to many years of Detty December with you. Thank God na this same Akure we Dey forever is the deal.",
    savings: "Package Delivered as Described",
    avatar: "MO",
    location: "Akure (Formerly Benue)"
  },
  {
    id: 2,
    name: "Pretty Tarhi Tina",
    year: 2023,
    quote: "For the past 3 years, i have never had any time to worry about buying Rice and other food stuffs or going to the market during Christmas! I always have foodstuffs to give my daughter whenever she is going back to school! Belleza Detty December has always come to my Rescue. I'm so glad i joined this Group! No regrets at all.",
    savings: "Consistent Subscriber (3 Years)",
    avatar: "PT",
    location: "Oba-ile Akure"
  },
  {
    id: 3,
    name: "Olayinka",
    year: 2024,
    quote: "I thank God for the success of this year detty December. God bless this platform to put food on my table. I was very happy when I receive my package (one bag of rice, pasta, noodles, cornflakes, seasoning cubes, 3 bottles of groundnut oil and many more)... in fact my heart rejoice. Thank you Belleza.",
    savings: "Full Package Received",
    avatar: "OL",
    location: "Lagos"
  },
  {
    id: 4,
    name: "Mary",
    year: 2019,
    quote: "I have been doing this with belleza for 5 years now even when we started with 3k from 3k to 4k and now 5k and have even recommended the detty December group to more than 6 people and it has truly been an amazing experience... This platform has helped us give consistently and make real impact. I encourage more people to join and be part of this good work.",
    savings: "5-Year Customer",
    avatar: "MA",
    location: "Akure"
  }
];

const gradients = [
  'from-purple-500 to-pink-500',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500'
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const index = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.offsetWidth;
    container.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Customer Experiences</h2>
          <p className="text-sm text-gray-500">Hear from our customers</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
      </div>

      {/* Testimonial Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="flex-shrink-0 w-full snap-center"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{testimonial.location}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-semibold text-purple-600">{testimonial.year}</span>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-purple-200" />
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">Customer Highlight</span>
                <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {testimonial.savings}
                </span>
              </div>

              {/* Gradient accent line */}
              <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${gradients[index % gradients.length]} mt-4`}></div>
            </Card>
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? 'w-8 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}