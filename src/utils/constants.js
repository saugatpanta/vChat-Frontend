export const API_URL = process.env.REACT_APP_API_URL;

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away'
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  CALL: 'call'
};

export const CALL_STATUS = {
  INITIATED: 'initiated',
  ANSWERED: 'answered',
  REJECTED: 'rejected',
  MISSED: 'missed',
  ENDED: 'ended'
};

export const STORY_DURATION = 24; // hours