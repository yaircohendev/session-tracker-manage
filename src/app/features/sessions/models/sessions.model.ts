type Event = 'VIEWPORT_SIZE' | 'MOUSE_MOVE' | 'MOUSE_CLICK';

export interface UserEvent {
  time_stamp: number;
  type: Event;
  x: number;
  y: number;
}

export interface Session {
  duration: number | null;
  sessionDate: string;
  sessions: UserEvent[];
  _id: string;
}

export interface UpdateSessionData {
  sessions: UserEvent[];
  sessionDate: string;
}
