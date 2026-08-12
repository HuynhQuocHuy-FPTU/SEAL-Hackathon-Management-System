export interface NavItem {
  label: string;
  id: string;
}

export interface Notification {
  title: string;
  text: string;
  time: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface ProfileMenuOption {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  isDangerous?: boolean;
}
