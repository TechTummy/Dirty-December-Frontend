import { useState } from 'react';
import { Plus, Edit, Trash2, Pin, X, AlertCircle } from 'lucide-react';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'delivery' | 'payment' | 'urgent' | 'general';
  isPinned: boolean;
  publishedAt: string;
  views: number;
}

export function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'Distribution Schedule Updated',
      message: 'December distribution will start on the 15th. Collection points have been announced.',
      type: 'delivery',
      isPinned: true,
      publishedAt: '2024-04-01 10:00 AM',
      views: 145
    },
    {
      id: 2,
      title: 'New Premium Items Added',
      message: 'We have added exclusive items to the Premium Bundle this year!',
      type: 'general',
      isPinned: false,
      publishedAt: '2024-03-28 02:30 PM',
      views: 98
    },
    {
      id: 3,
      title: 'Payment Deadline Reminder',
      message: 'April contributions must be submitted by April 5th to avoid delays.',
      type: 'payment',
      isPinned: true,
      publishedAt: '2024-03-25 09:00 AM',
      views: 156
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'delivery' | 'payment' | 'urgent' | 'general',
    isPinned: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'general',
      isPinned: false
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      isPinned: announcement.isPinned
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'general',
      isPinned: false
    });
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (editingAnnouncement) {
      // Update existing announcement
      setAnnouncements(announcements.map(a => 
        a.id === editingAnnouncement.id 
          ? {
              ...a,
              title: formData.title,
              message: formData.message,
              type: formData.type,
              isPinned: formData.isPinned
            }
          : a
      ));
    } else {
      // Create new announcement
      const newAnnouncement: Announcement = {
        id: Math.max(...announcements.map(a => a.id), 0) + 1,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        isPinned: formData.isPinned,
        publishedAt: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        views: 0
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }

    handleCloseModal();
  };

  const handleTogglePin = (id: number) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    ));
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    setShowDeleteConfirm(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delivery': return 'bg-emerald-100 text-emerald-700';
      case 'payment': return 'bg-amber-100 text-amber-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Manage platform announcements</p>
        </div>
        <GradientButton onClick={handleOpenCreateModal}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </span>
        </GradientButton>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-purple-600 fill-purple-600" />
                    )}
                    <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className="text-xs text-gray-500">{announcement.publishedAt}</span>
                    <span className="text-xs text-gray-500">• {announcement.views} views</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleTogglePin(announcement.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Pin className="w-4 h-4" />
                  <span className="text-sm font-medium">{announcement.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>
                <button 
                  onClick={() => handleOpenEditModal(announcement)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-gray-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(announcement.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for creating/editing announcements */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingAnnouncement ? 'Update announcement details' : 'Create a new platform announcement'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter announcement title..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Enter announcement message..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Type</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'delivery' | 'payment' | 'urgent' | 'general' })}
                    >
                      <option value="general">General</option>
                      <option value="delivery">Delivery</option>
                      <option value="payment">Payment</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Options</label>
                    <label className="flex items-center gap-3 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-purple-700">Pin announcement</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-slate-50">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <GradientButton onClick={handleSave}>
                <span className="px-4">
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </span>
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm !== null && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowDeleteConfirm(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 px-6 py-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Confirm Delete</h2>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Delete this announcement?</p>
                    <p className="text-sm text-gray-600">This action cannot be undone. The announcement will be permanently removed.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}