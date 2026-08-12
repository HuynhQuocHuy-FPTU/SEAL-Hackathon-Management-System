import EventOverviewTab from '../../component/eventCoordinator/EventOverviewTab';
import { useEffect, useState } from 'react';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { getAllEvent } from '../../services/event/eventService';
import { useNotification } from '../../hook/useNotification';
export default function OverviewPage() {
  const { addNotification } = useNotification();
  const [events, setEvent] = useState<Hackathon[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  useEffect(() => {
    const fetchEvents= async () => {
      try {
        const eventsRes = await getAllEvent();
        setEvent(eventsRes.data);
        if (eventsRes.data && eventsRes.data.length > 0) {
          setSelectedEventId(eventsRes.data[0].eventId);
        }
      } catch (error: any) {
        addNotification("Error", error.response?.data?.message || "Lỗi tải sự kiện");
      }
    }
    fetchEvents();
  }, [])

  return (
    <EventOverviewTab
      events={events}
      selectedEventId={selectedEventId}
      onSelectEventId={setSelectedEventId}
    />
  );
}
