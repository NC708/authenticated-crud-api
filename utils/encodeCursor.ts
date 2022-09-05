import { btoa } from 'buffer';

export default function (cursor: any) {
  try {
    cursor = btoa(JSON.stringify(cursor));
    return cursor;
  } catch {
    return null;
  }
}
