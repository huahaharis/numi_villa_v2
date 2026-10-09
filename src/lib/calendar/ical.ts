export interface IcalEventInput {
  uid: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  summary: string
  description?: string
  status?: string
}

/**
 * Format YYYY-MM-DD to iCal date format YYYYMMDD
 */
function toIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function addDaysString(dateStr: string, days: number = 1): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  const yStr = dt.getUTCFullYear()
  const mStr = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dStr = String(dt.getUTCDate()).padStart(2, '0')
  return `${yStr}-${mStr}-${dStr}`
}

/**
 * Merge overlapping or contiguous date ranges to prevent conflicting events
 */
export function mergeEventDateRanges(events: IcalEventInput[]): IcalEventInput[] {
  if (events.length <= 1) return events;

  // Sort by startDate, then endDate
  const sorted = [...events].sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
    return a.endDate.localeCompare(b.endDate);
  });

  const merged: IcalEventInput[] = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // If next event overlaps or is contiguous with current
    if (next.startDate <= current.endDate) {
      if (next.endDate > current.endDate) {
        current.endDate = next.endDate;
      }
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Generate RFC 5545 compliant iCalendar string formatted to match Airbnb standards
 * (accepted universally by Agoda, Booking.com, VRBO, and Google Calendar)
 */
export function generateIcalFeed({
  events,
}: {
  villaName?: string
  events: IcalEventInput[]
}): string {
  const cleanEvents = mergeEventDateRanges(events);

  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar//EN',
    'CALSCALE:GREGORIAN',
    'VERSION:2.0',
  ];

  for (const event of cleanEvents) {
    const dtStart = toIcalDate(event.startDate);
    const dtEnd = toIcalDate(event.endDate);

    lines.push('BEGIN:VEVENT');
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`UID:${event.uid}`);
    lines.push('SUMMARY:Reserved');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export interface ParsedIcalEvent {
  uid: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  summary: string
  description?: string
}

/**
 * Parse an iCal date string (e.g. 20261015 or 20261015T120000Z) to YYYY-MM-DD
 */
function parseIcalDateString(dateVal: string): string {
  // Strip params like VALUE=DATE:
  const cleanVal = dateVal.includes(':') ? dateVal.split(':').pop()! : dateVal
  const trimmed = cleanVal.trim()

  if (trimmed.length >= 8) {
    const year = trimmed.substring(0, 4)
    const month = trimmed.substring(4, 6)
    const day = trimmed.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  return trimmed
}

/**
 * Parse RFC 5545 iCalendar content to structured events
 */
export function parseIcalFeed(icsContent: string): ParsedIcalEvent[] {
  const events: ParsedIcalEvent[] = []

  // Unfold folded lines (lines starting with space or tab are continuation)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
  const rawLines = unfolded.split(/\r?\n/)

  let inEvent = false
  let currentEvent: Partial<ParsedIcalEvent> = {}

  for (const rawLine of rawLines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
      continue
    }

    if (line === 'END:VEVENT') {
      if (currentEvent.startDate) {
        // If DTEND is missing, fallback to next day
        const endDate = currentEvent.endDate || addDaysString(currentEvent.startDate, 1)
        const uid = currentEvent.uid || `event-${currentEvent.startDate}-${endDate}-${Math.random().toString(36).slice(2, 8)}`
        events.push({
          uid,
          startDate: currentEvent.startDate,
          endDate,
          summary: currentEvent.summary || 'Reserved',
          description: currentEvent.description,
        })
      }
      inEvent = false
      currentEvent = {}
      continue
    }

    if (inEvent) {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue

      const propPart = line.substring(0, colonIndex).toUpperCase()
      const value = line.substring(colonIndex + 1)

      if (propPart.startsWith('UID')) {
        currentEvent.uid = value.trim()
      } else if (propPart.startsWith('DTSTART')) {
        currentEvent.startDate = parseIcalDateString(value)
      } else if (propPart.startsWith('DTEND')) {
        currentEvent.endDate = parseIcalDateString(value)
      } else if (propPart.startsWith('SUMMARY')) {
        currentEvent.summary = value.trim()
      } else if (propPart.startsWith('DESCRIPTION')) {
        currentEvent.description = value.trim()
      }
    }
  }

  return events
}

