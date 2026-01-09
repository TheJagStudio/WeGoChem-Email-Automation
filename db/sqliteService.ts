import initSqlJs, { Database } from 'sql.js';
import localforage from 'localforage';

let db: Database | null = null;
const DB_KEY = 'wegochem_sqlite_db';

export const initSQLite = async () => {
  if (db) return db;

  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });

    const savedDb = await localforage.getItem<Uint8Array>(DB_KEY);

    if (savedDb) {
      db = new SQL.Database(savedDb);
    } else {
      db = new SQL.Database();
    }
    
    // Initialize tables if they don't exist
    initTables();
    
    saveDB();
    console.log("SQLite Service Initialized");
    return db;
  } catch (error) {
    console.error("Failed to initialize SQLite:", error);
    throw error;
  }
};

const saveDB = () => {
  if (!db) return;
  const data = db.export();
  localforage.setItem(DB_KEY, data);
};

const initTables = () => {
  if (!db) return;
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT,
      subject TEXT,
      segment TEXT,
      status TEXT,
      sent INTEGER DEFAULT 0,
      opened INTEGER DEFAULT 0,
      clicked INTEGER DEFAULT 0,
      converted INTEGER DEFAULT 0,
      audienceSize INTEGER DEFAULT 0,
      lastUpdated TEXT,
      templateId TEXT,
      funnelConfig TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      company TEXT,
      role TEXT,
      industry TEXT,
      tags TEXT,
      status TEXT,
      score INTEGER DEFAULT 0,
      history TEXT,
      lastActivity TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT,
      subject TEXT,
      category TEXT,
      content TEXT,
      tags TEXT,
      isSystem INTEGER,
      lastModified TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      domain TEXT,
      status TEXT,
      spfVerified INTEGER,
      dkimVerified INTEGER,
      dmarcVerified INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      isRead INTEGER,
      timestamp TEXT,
      link TEXT
    )`
  ];

  tables.forEach(sql => db!.run(sql));
};

export const runQuery = (sql: string, bind: any[] = []) => {
  if (!db) throw new Error("DB not initialized");
  try {
    const stmt = db.prepare(sql, bind);
    const result = [];
    while (stmt.step()) {
        result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  } catch (e) {
    console.error("Query Error", e, sql);
    return [];
  }
};

export const runCommand = (sql: string, bind: any[] = []) => {
  if (!db) throw new Error("DB not initialized");
  try {
      db.run(sql, bind);
      saveDB();
  } catch (e) {
      console.error("Command Error", e, sql);
      throw e;
  }
};

export const getDB = () => db;
export const dbService = { initSQLite, runQuery, runCommand };