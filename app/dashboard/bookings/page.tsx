"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Video, CheckCircle2, XCircle,
  Loader2, User, Mail, Phone, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { getCreatorBookings, Appointment } from '@/services/bookingService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const LOCATION_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  skype: 'Skype',
  physical: 'In-Person',
  other: 'Online',
};

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

function AppointmentCard({ appt, onStatusChange }: { appt: Appointment; onStatusChange: (id: string, s: Appointment['status']) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const statusCfg = STATUS_CONFIG[appt.status];
  const isPhysical = appt.locationType === 'physical';
  const formattedDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  const changeStatus = async (newStatus: Appointment['status']) => {
    if (!appt.id || updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'appointments', appt.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      onStatusChange(appt.id, newStatus);
      toast.success(`Appointment ${newStatus}.`);
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      <div className="p-4 space-y-3">
        {/* Row 1: date/time + status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-foreground">{appt.productName}</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formattedDate}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{appt.startTime} – {appt.endTime}</span>
              <span className={`flex items-center gap-1 ${isPhysical ? 'text-emerald-600' : 'text-blue-500'}`}>
                {isPhysical ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {LOCATION_LABELS[appt.locationType || 'other']}
              </span>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Row 2: customer info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="h-3 w-3" />{appt.customerName}</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{appt.customerEmail}</span>
          {appt.customerPhone && (
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{appt.customerPhone}</span>
          )}
        </div>

        {/* Row 3: actions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {appt.status !== 'confirmed' && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10" disabled={updating} onClick={() => changeStatus('confirmed')}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
            </Button>
          )}
          {appt.status !== 'cancelled' && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10" disabled={updating} onClick={() => changeStatus('cancelled')}>
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
          {appt.intakeAnswers && Object.keys(appt.intakeAnswers).length > 0 && (
            <button
              className="ml-auto text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => setExpanded(e => !e)}
            >
              Intake answers {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Expandable intake answers */}
        {expanded && appt.intakeAnswers && (
          <div className="pt-2 border-t border-border space-y-2">
            {Object.entries(appt.intakeAnswers).map(([key, val]) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-foreground">{key}:</span>{' '}
                <span className="text-muted-foreground">{Array.isArray(val) ? val.join(', ') : val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Appointment['status']>('all');

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCreatorBookings(user.uid);
        setAppointments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filtered = appointments.filter(a => {
    const matchesSearch =
      !search.trim() ||
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      a.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all appointments booked with you.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: counts.all, color: 'text-foreground' },
          { label: 'Confirmed', count: counts.confirmed, color: 'text-green-500' },
          { label: 'Pending', count: counts.pending, color: 'text-yellow-500' },
          { label: 'Cancelled', count: counts.cancelled, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search name, email, or session..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'confirmed', 'pending', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {s} {s !== 'all' && `(${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {appointments.length === 0
            ? 'No bookings yet. Share your booking link to start receiving appointments.'
            : 'No bookings match your current filters.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
