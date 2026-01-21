import { useRef, useState } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoTestimonial {
  id: number;
  name: string;
  location: string;
  videoUrl: string;
  thumbnail: string;
}

// Placeholder video testimonials - replace with actual video URLs
// Main featured video
const mainVideo = {
  id: 0,
  name: "Welcome",
  location: "Experience the Joy",
  videoUrl: "/videos/main.mp4",
  thumbnail: "" // Browser will generate thumbnail from first frame
};

// Carousel videos
const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "",
    location: "",
    videoUrl: "/videos/video2.mp4",
    thumbnail: ""
  },
  {
    id: 2,
    name: "",
    location: "",
    videoUrl: "/videos/video3.mp4",
    thumbnail: ""
  },
  {
    id: 3,
    name: "",
    location: "",
    videoUrl: "/videos/video4.mp4",
    thumbnail: ""
  },
  {
    id: 4,
    name: "",
    location: "",
    videoUrl: "/videos/video5.mp4",
    thumbnail: ""
  },
  {
    id: 5,
    name: "",
    location: "",
    videoUrl: "/videos/video6.mp4",
    thumbnail: ""
  },
  {
    id: 6,
    name: "",
    location: "",
    videoUrl: "/videos/video7.mp4",
    thumbnail: ""
  },
  {
    id: 7,
    name: "",
    location: "",
    videoUrl: "/videos/vidoe8.mp4", // Note: keeping typo as per filename
    thumbnail: ""
  }
];

export function VideoTestimonials() {
  const sliderRef = useRef<Slider>(null);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    centerMode: true,
    centerPadding: '40px',
    beforeChange: () => {
      // Pause all videos when changing slides
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
      // Don't reset playingVideo if it's the main video (id 0)
      if (playingVideo !== 0) {
        setPlayingVideo(null);
      }
    },
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerPadding: '30px',
        }
      }
    ]
  };

  const handlePlayVideo = (id: number) => {
    // Pause any currently playing video first
    if (playingVideo !== null && playingVideo !== id) {
      const currentVideo = videoRefs.current[playingVideo];
      if (currentVideo) currentVideo.pause();
    }

    const video = videoRefs.current[id];
    if (video) {
      setPlayingVideo(id); // Set state immediately for UI feedback
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Ignore AbortError - it's expected when user quickly changes slides
          if (error.name !== 'AbortError') {
            console.error('Error playing video:', error);
            setPlayingVideo(null); // Reset state if video fails to play
          }
        });
      }
    }
  };

  const handlePauseVideo = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      video.pause();
      setPlayingVideo(null);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = !muted;
      }
    });
  };

  const renderVideoCard = (videoData: VideoTestimonial, isFeatured = false) => (
    <div className={`relative mx-auto ${isFeatured ? 'w-full max-w-2xl px-4 mb-12' : ''}`} style={{ maxWidth: isFeatured ? 'none' : '280px' }}>
      {/* Container - aspect ratio adapts based on featured status */}
      <div className={`relative ${isFeatured ? 'aspect-[3/4] md:aspect-[4/3]' : 'aspect-[9/16]'} rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-white/20`}>
        
        {/* Video Element */}
        <video
          ref={(el) => { videoRefs.current[videoData.id] = el; }}
          className="w-full h-full object-cover"
          playsInline
          muted={muted}
          // Remove poster to show first frame naturally
          onEnded={() => setPlayingVideo(null)}
          onClick={() => {
            if (playingVideo === videoData.id) {
              handlePauseVideo(videoData.id);
            } else {
              handlePlayVideo(videoData.id);
            }
          }}
        >
          <source src={videoData.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Play/Pause Button Overlay - Only show when not playing */}
        {playingVideo !== videoData.id && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
            onClick={() => handlePlayVideo(videoData.id)}
          >
            <div className={`rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${isFeatured ? 'w-20 h-20' : 'w-16 h-16'}`}>
              <Play className={`${isFeatured ? 'w-10 h-10' : 'w-8 h-8'} text-purple-600 ml-1`} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Video Controls - Show when playing */}
        {playingVideo === videoData.id && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePauseVideo(videoData.id);
              }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Pause className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
          <p className={`${isFeatured ? 'text-2xl' : ''} text-white font-bold mb-1`}>{videoData.name}</p>
          <p className="text-white/80 text-sm">{videoData.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="font-bold text-gray-900 mb-1 text-3xl">Our Stories</h2>
        <p className="text-gray-600 text-lg">See the joy we bring to our community</p>
      </div>

      {/* Featured Video */}
      {renderVideoCard(mainVideo, true)}

      <div className="text-center mb-6">
        <h3 className="font-bold text-gray-900 text-xl">More Testimonials</h3>
      </div>

      {/* Video Carousel */}
      <div className="video-carousel -mx-6">
        <Slider ref={sliderRef} {...settings}>
          {videoTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="px-2">
              {renderVideoCard(testimonial)}
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