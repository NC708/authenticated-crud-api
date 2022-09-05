import { atob } from 'buffer';

export default function (cursor: any) {
  try {
    cursor = JSON.parse(atob(cursor));
    cursor.timestamp = new Date(cursor.timestamp);
    return cursor;
  } catch {
    return null;
  }
}
