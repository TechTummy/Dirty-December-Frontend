import { ArrowLeft, Megaphone, AlertTriangle, Bell } from 'lucide-react';
import { Card } from '../components/Card';
import { announcements } from '../data/mockData';

interface AnnouncementsProps {
  onBack: () => void;
}

export function Announcements({ onBack }: AnnouncementsProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Announcements</h1>
        </div>
        <p className="text-purple-100 text-sm font-medium">
          Stay updated with the latest news
        </p>
      </div>

      <div className="px-6 -mt-6 pb-6">
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id}
              className={`border-0 shadow-md hover:shadow-lg transition-shadow ${
                announcement.priority === 'high' 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-orange-500' 
                  : 'bg-white'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  announcement.priority === 'high'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-500/30'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-purple-500/30'
                }`}>
                  {announcement.priority === 'high' ? (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  ) : (
                    <Megaphone className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                    {announcement.priority === 'high' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {announcement.message}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(announcement.date).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Stay Informed</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Important updates including distribution dates, package changes, and payment confirmations will appear here. 
                Check regularly to stay up to date.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
