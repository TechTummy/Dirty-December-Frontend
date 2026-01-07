import { Play, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRef, useState } from 'react';

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  onClick?: () => void;
}

function VideoCard({ title, description, thumbnail, duration, onClick }: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-gray-100"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-purple-600 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur rounded-lg">
          <span className="text-xs font-semibold text-white">{duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

export function LearnSection() {
  const videos = [
    {
      title: 'How to Use Detty December App',
      description: 'Complete walkthrough of the app features, making contributions, and tracking your benefits.',
      thumbnail: 'https://images.unsplash.com/photo-1764664281863-f736f2d942bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjB0dXRvcmlhbHxlbnwxfHx8fDE3Njc2ODMyNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '5:24'
    },
    {
      title: 'Terms & Conditions Explained',
      description: 'Understanding your rights, responsibilities, and what to expect from the platform.',
      thumbnail: 'https://images.unsplash.com/photo-1628582453226-a0027de09af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudCUyMHJlYWRpbmclMjBsZWdhbHxlbnwxfHx8fDE3Njc3ODEzNjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '3:45'
    }
  ];

  const handleVideoClick = (title: string) => {
    // In a real app, this would open a video player modal
    alert(`Opening video: ${title}\n\nIn a production app, this would play the actual video.`);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Learn & Explore</h2>
            <p className="text-xs text-gray-600">Watch tutorials and guides</p>
          </div>
        </div>
      </div>

      {/* Carousel Container with Navigation */}
      <div 
        className="relative group"
        onMouseEnter={() => {
          setIsHovered(true);
          checkScrollPosition();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-xl items-center justify-center border border-gray-200 hover:bg-white hover:scale-110 transition-all ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={handleScrollRight}
            className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-xl items-center justify-center border border-gray-200 hover:bg-white hover:scale-110 transition-all ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Horizontal Scroll Container */}
        <div 
          ref={containerRef}
          onScroll={checkScrollPosition}
          className="overflow-x-auto -mx-6 px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex gap-4">
            {videos.map((video, index) => (
              <VideoCard
                key={index}
                {...video}
                onClick={() => handleVideoClick(video.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 text-center">Swipe to see more →</p>
      </div>
    </div>
  );
}