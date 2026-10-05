import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CounselingRecord, SavedPrescriptionItem, SavedIncidentLog, TeacherStats, StressAnalyticsReport } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, 'prescriptions.json');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Ensure data folder and files exist
async function ensureFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      await fs.access(SESSIONS_FILE);
    } catch {
      await fs.writeFile(SESSIONS_FILE, JSON.stringify([]), 'utf-8');
    }

    try {
      await fs.access(PRESCRIPTIONS_FILE);
    } catch {
      await fs.writeFile(PRESCRIPTIONS_FILE, JSON.stringify([]), 'utf-8');
    }

    try {
      await fs.access(INCIDENTS_FILE);
    } catch {
      await fs.writeFile(INCIDENTS_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize data directory/files:', err);
  }
}

// Generic file helpers
async function readJson<T>(filePath: string): Promise<T[]> {
  await ensureFiles();
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return [];
  }
}

async function writeJson<T>(filePath: string, data: T[]): Promise<void> {
  await ensureFiles();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. Counseling Sessions
export async function getSessions(search?: string, category?: string): Promise<CounselingRecord[]> {
  let list = await readJson<CounselingRecord>(SESSIONS_FILE);
  if (category && category !== '전체') {
    list = list.filter((s) => s.category === category);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        (s.teacherNote && s.teacherNote.toLowerCase().includes(q))
    );
  }
  // Sort latest first
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSessionById(id: string): Promise<CounselingRecord | null> {
  const list = await readJson<CounselingRecord>(SESSIONS_FILE);
  return list.find((s) => s.id === id) || null;
}

export async function saveSession(record: CounselingRecord): Promise<CounselingRecord> {
  const list = await readJson<CounselingRecord>(SESSIONS_FILE);
  const existingIdx = list.findIndex((s) => s.id === record.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...record, updatedAt: Date.now() };
  } else {
    list.unshift(record);
  }
  await writeJson(SESSIONS_FILE, list);
  return record;
}

export async function updateSession(id: string, updates: Partial<CounselingRecord>): Promise<CounselingRecord | null> {
  const list = await readJson<CounselingRecord>(SESSIONS_FILE);
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    ...updates,
    updatedAt: Date.now(),
  };
  await writeJson(SESSIONS_FILE, list);
  return list[idx];
}

export async function deleteSession(id: string): Promise<boolean> {
  const list = await readJson<CounselingRecord>(SESSIONS_FILE);
  const filtered = list.filter((s) => s.id !== id);
  if (filtered.length === list.length) return false;
  await writeJson(SESSIONS_FILE, filtered);
  return true;
}

// 2. Prescriptions
export async function getPrescriptions(): Promise<SavedPrescriptionItem[]> {
  const list = await readJson<SavedPrescriptionItem>(PRESCRIPTIONS_FILE);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function savePrescription(item: SavedPrescriptionItem): Promise<SavedPrescriptionItem> {
  const list = await readJson<SavedPrescriptionItem>(PRESCRIPTIONS_FILE);
  const existingIdx = list.findIndex((p) => p.id === item.id);
  if (existingIdx !== -1) {
    list[existingIdx] = item;
  } else {
    list.unshift(item);
  }
  await writeJson(PRESCRIPTIONS_FILE, list);
  return item;
}

export async function deletePrescription(id: string): Promise<boolean> {
  const list = await readJson<SavedPrescriptionItem>(PRESCRIPTIONS_FILE);
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) return false;
  await writeJson(PRESCRIPTIONS_FILE, filtered);
  return true;
}

// 3. Incident Logs (Boundary Protection Logs)
export async function getIncidentLogs(): Promise<SavedIncidentLog[]> {
  const list = await readJson<SavedIncidentLog>(INCIDENTS_FILE);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveIncidentLog(item: SavedIncidentLog): Promise<SavedIncidentLog> {
  const list = await readJson<SavedIncidentLog>(INCIDENTS_FILE);
  const existingIdx = list.findIndex((i) => i.id === item.id);
  if (existingIdx !== -1) {
    list[existingIdx] = item;
  } else {
    list.unshift(item);
  }
  await writeJson(INCIDENTS_FILE, list);
  return item;
}

export async function deleteIncidentLog(id: string): Promise<boolean> {
  const list = await readJson<SavedIncidentLog>(INCIDENTS_FILE);
  const filtered = list.filter((i) => i.id !== id);
  if (filtered.length === list.length) return false;
  await writeJson(INCIDENTS_FILE, filtered);
  return true;
}

// 4. Aggregated Statistics
export async function getStats(): Promise<TeacherStats> {
  const sessions = await readJson<CounselingRecord>(SESSIONS_FILE);
  const prescriptions = await readJson<SavedPrescriptionItem>(PRESCRIPTIONS_FILE);
  const incidents = await readJson<SavedIncidentLog>(INCIDENTS_FILE);

  let totalMessages = 0;
  const weatherDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};
  const counselorDistribution: Record<string, number> = {};

  for (const s of sessions) {
    totalMessages += s.messages ? s.messages.length : 0;
    
    if (s.weather) {
      weatherDistribution[s.weather] = (weatherDistribution[s.weather] || 0) + 1;
    }
    if (s.category) {
      categoryDistribution[s.category] = (categoryDistribution[s.category] || 0) + 1;
    }
    if (s.counselorName) {
      counselorDistribution[s.counselorName] = (counselorDistribution[s.counselorName] || 0) + 1;
    }
  }

  return {
    totalSessions: sessions.length,
    totalMessages,
    totalPrescriptions: prescriptions.length,
    totalIncidentLogs: incidents.length,
    weatherDistribution,
    categoryDistribution,
    counselorDistribution,
  };
}

// 5. Export and Reset
export async function exportAllData() {
  const sessions = await readJson<CounselingRecord>(SESSIONS_FILE);
  const prescriptions = await readJson<SavedPrescriptionItem>(PRESCRIPTIONS_FILE);
  const incidents = await readJson<SavedIncidentLog>(INCIDENTS_FILE);

  return {
    exportedAt: new Date().toISOString(),
    sessions,
    prescriptions,
    incidents,
  };
}

export async function clearAllData(): Promise<void> {
  await writeJson(SESSIONS_FILE, []);
  await writeJson(PRESCRIPTIONS_FILE, []);
  await writeJson(INCIDENTS_FILE, []);
  try {
    await fs.unlink(ANALYTICS_FILE);
  } catch {}
}

// 6. Stress Analytics Report
export async function getAnalyticsReport(): Promise<StressAnalyticsReport | null> {
  await ensureFiles();
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveAnalyticsReport(report: StressAnalyticsReport): Promise<StressAnalyticsReport> {
  await ensureFiles();
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(report, null, 2), 'utf-8');
  return report;
}
