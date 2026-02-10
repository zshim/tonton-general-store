import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle } from 'lucide-react';
import { NotificationType } from '../../types';

const Notifications = () => {
  const { user, notifications, markNotificationRead } = useApp();

  const myNotes = notifications.filter(n => n.userId === user?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
         <Bell className="h-6 w-6 text-emerald-600" />
         <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
      </header>

      <div className="space-y-4">
         {myNotes.length === 0 ? (
             <div className="text-center p-12 bg-white rounded-xl border border-slate-100 text-slate-400">
                 No notifications.
             </div>
         ) : (
             myNotes.map(note => (
                 <div 
                   key={note.id} 
                   className={`p-4 rounded-xl border transition-all ${
                       note.isRead 
                       ? 'bg-slate-50 border-slate-100 opacity-75' 
                       : 'bg-white border-emerald-100 shadow-sm border-l-4 border-l-emerald-500'
                   }`}
                 >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                             <div className={`mt-1 p-2 rounded-full ${
                                 note.type === NotificationType.REMINDER ? 'bg-amber-100 text-amber-600' : 
                                 note.type === NotificationType.PROMOTION ? 'bg-purple-100 text-purple-600' :
                                 'bg-blue-100 text-blue-600'
                             }`}>
                                 <Bell size={16} />
                             </div>
                             <div>
                                 <h4 className={`font-bold ${note.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{note.title}</h4>
                                 <p className="text-slate-600 text-sm mt-1">{note.message}</p>
                                 <p className="text-xs text-slate-400 mt-2">{new Date(note.date).toLocaleString()}</p>
                             </div>
                        </div>
                        {!note.isRead && (
                            <button 
                              onClick={() => markNotificationRead(note.id)}
                              className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-full"
                              title="Mark as read"
                            >
                                <CheckCircle size={18} />
                            </button>
                        )}
                    </div>
                 </div>
             ))
         )}
      </div>
    </div>
  );
};

export default Notifications;