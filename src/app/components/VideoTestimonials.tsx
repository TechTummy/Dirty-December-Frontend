import { useRef } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface VideoTestimonial {
  id: number;
  name: string;
  location: string;
  videoUrl: string;
  thumbnail: string;
}

// Placeholder video testimonials - replace with actual video URLs
const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Amaka Okonkwo",
    location: "Lagos",
    videoUrl: "https://example.com/video1.mp4", // Replace with actual video URL
    thumbnail: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=500&fit=crop"
  },
  {
    id: 2,
    name: "Chidi Nwosu",
    location: "Abuja",
    videoUrl: "https://example.com/video2.mp4", // Replace with actual video URL
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=500&fit=crop"
  },
  {
    id: 3,
    name: "Blessing Adeyemi",
    location: "Ibadan",
    videoUrl: "https://example.com/video3.mp4", // Replace with actual video URL
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=500&fit=crop"
  }
];

export function VideoTestimonials() {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    centerMode: true,
    centerPadding: '40px',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerPadding: '30px',
        }
      }
    ]
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className="font-bold text-gray-900 mb-1">Putting Smiles on Faces</h2>
        <p className="text-sm text-gray-600">See how we've blessed friends and family in past years</p>
      </div>

      {/* Video Carousel */}
      <div className="video-carousel -mx-6">
        <Slider ref={sliderRef} {...settings}>
          {videoTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="px-2">
              <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
                {/* Portrait Video Container */}
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-800 to-slate-900">
                  {/* Thumbnail with Play Button Overlay */}
                  <img 
                    src={testimonial.thumbnail}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Gradient Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <p className="text-white font-bold mb-1">{testimonial.name}</p>
                    <p className="text-white/80 text-sm">{testimonial.location}</p>
                  </div>

                  {/* Decorative Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/10 pointer-events-none"></div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        /* Base slick styles */
        .video-carousel .slick-slider {
          position: relative;
          display: block;
          box-sizing: border-box;
          user-select: none;
          -webkit-touch-callout: none;
          -khtml-user-select: none;
          -ms-touch-action: pan-y;
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }
        
        .video-carousel .slick-list {
          position: relative;
          display: block;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        
        .video-carousel .slick-list:focus {
          outline: none;
        }
        
        .video-carousel .slick-list.dragging {
          cursor: pointer;
          cursor: hand;
        }
        
        .video-carousel .slick-slider .slick-track,
        .video-carousel .slick-slider .slick-list {
          transform: translate3d(0, 0, 0);
        }
        
        .video-carousel .slick-track {
          position: relative;
          top: 0;
          left: 0;
          display: flex !important;
          align-items: center;
        }
        
        .video-carousel .slick-track:before,
        .video-carousel .slick-track:after {
          display: table;
          content: '';
        }
        
        .video-carousel .slick-track:after {
          clear: both;
        }
        
        .video-carousel .slick-loading .slick-track {
          visibility: hidden;
        }
        
        .video-carousel .slick-slide {
          display: none;
          float: left;
          height: 100%;
          min-height: 1px;
          opacity: 0.4;
          transform: scale(0.85);
          transition: all 0.3s ease;
        }
        
        .video-carousel .slick-slide.slick-active.slick-center {
          opacity: 1;
          transform: scale(1);
        }
        
        .video-carousel .slick-slide > div {
          display: block;
        }
        
        .video-carousel .slick-slide img {
          display: block;
        }
        
        .video-carousel .slick-initialized .slick-slide {
          display: block;
        }
        
        .video-carousel .slick-loading .slick-slide {
          visibility: hidden;
        }
        
        .video-carousel .slick-vertical .slick-slide {
          display: block;
          height: auto;
          border: 1px solid transparent;
        }
      `}</style>
    </div>
  );
}