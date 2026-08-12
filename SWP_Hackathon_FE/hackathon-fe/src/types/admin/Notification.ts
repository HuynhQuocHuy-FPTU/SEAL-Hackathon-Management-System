export interface Notification {
  id: string;
  type: 'Success' | 'Info' | 'Warning' | 'Error';
  message: string;
  timestamp: string;
}
