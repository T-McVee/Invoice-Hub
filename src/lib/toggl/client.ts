// Toggl Track API client
// Docs: https://engineering.toggl.com/docs/

const TOGGL_API_BASE = 'https://api.track.toggl.com/api/v9';
const TOGGL_REPORTS_BASE = 'https://api.track.toggl.com/reports/api/v3';

interface TogglTimeEntry {
  id: number;
  workspace_id: number;
  project_id: number | null;
  description: string;
  start: string;
  stop: string | null;
  duration: number; // seconds, negative if running
  tags: string[];
}

interface TogglProject {
  id: number;
  name: string;
  workspace_id: number;
}

export interface TimeEntrySummary {
  totalSeconds: number;
  totalHours: number;
  entries: Array<{
    date: string;
    description: string;
    durationSeconds: number;
    durationHours: number;
  }>;
}

function getAuthHeader(): string {
  const apiToken = process.env.TOGGL_API_TOKEN;
  if (!apiToken) {
    throw new Error('TOGGL_API_TOKEN environment variable is not set');
  }
  // Toggl uses Basic auth with API token as username and "api_token" as password
  return `Basic ${Buffer.from(`${apiToken}:api_token`).toString('base64')}`;
}

function getWorkspaceId(): string {
  const workspaceId = process.env.TOGGL_WORKSPACE_ID;
  if (!workspaceId) {
    throw new Error('TOGGL_WORKSPACE_ID environment variable is not set');
  }
  return workspaceId;
}

/**
 * Fetch time entries for a specific month and project
 */
export async function fetchTimeEntries(
  projectId: string,
  month: string // YYYY-MM format
): Promise<TimeEntrySummary> {
  const workspaceId = getWorkspaceId();

  // Calculate start and end dates for the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 0)); // Last day of month

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Use the search endpoint for time entries
  const response = await fetch(
    `${TOGGL_API_BASE}/me/time_entries?start_date=${startStr}&end_date=${endStr}`,
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Toggl API error: ${response.status} - ${error}`);
  }

  const entries: TogglTimeEntry[] = await response.json();

  // Filter by project ID and aggregate
  const projectEntries = entries.filter(
    (e) => e.project_id?.toString() === projectId && e.duration > 0
  );

  const totalSeconds = projectEntries.reduce((sum, e) => sum + e.duration, 0);

  return {
    totalSeconds,
    totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
    entries: projectEntries.map((e) => ({
      date: e.start.split('T')[0],
      description: e.description || '(no description)',
      durationSeconds: e.duration,
      durationHours: Math.round((e.duration / 3600) * 100) / 100,
    })),
  };
}

/**
 * Fetch detailed timesheet PDF from Toggl Reports API
 * Returns a URL to the generated PDF (or blob URL for storage)
 */
export async function fetchTimesheetPdf(
  projectId: string,
  month: string // YYYY-MM format
): Promise<{ pdfBuffer: Buffer; filename: string }> {
  const workspaceId = getWorkspaceId();

  // Calculate start and end dates for the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${lastDay}`;

  // Use Toggl Reports API to generate detailed report PDF
  const response = await fetch(
    `${TOGGL_REPORTS_BASE}/workspace/${workspaceId}/search/time_entries.pdf`,
    {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        project_ids: [parseInt(projectId, 10)],
        grouped: true,
        sub_grouping: 'time_entries',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Toggl Reports API error: ${response.status} - ${error}`);
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  const filename = `timesheet-${month}-${projectId}.pdf`;

  return { pdfBuffer, filename };
}

/**
 * Verify Toggl API connection and credentials
 */
export async function verifyConnection(): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${TOGGL_API_BASE}/me`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, email: data.email };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

