import { v4 as uuidv4 } from 'uuid';
import { getFirestoreEntries, saveFirestoreEntry } from '../config/firebase.js';

class SalesService {
  constructor() {
    this._inMemoryEntries = [];
    this._isInitialized = false;
    this._initStore();
  }

  /**
   * Initialize local store with initial fallback seed data matching phone app
   */
  async _initStore() {
    if (this._isInitialized) return;

    // Seed mock data so both systems have initial records immediately
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    this._inMemoryEntries = [
      {
        id: 'seed-cenet-1',
        systemType: 'CENET',
        recordDate: yesterday.toISOString(),
        submissionDate: today.toISOString(),
        field1Amount: 187750.24, // Restaurant
        field2Amount: 28720.01,  // Lounge
        totalSales: 216470.25,
        importSource: 'API',
        isLate: false,
        delayReason: ''
      },
      {
        id: 'seed-cenet-2',
        systemType: 'CENET',
        recordDate: threeDaysAgo.toISOString(),
        submissionDate: today.toISOString(),
        field1Amount: 266161.57,
        field2Amount: 101890.13,
        totalSales: 368051.70,
        importSource: 'Excel',
        isLate: true,
        delayReason: 'Server connectivity downtime at branch restaurant pos system'
      },
      {
        id: 'seed-loop-1',
        systemType: 'LOOP',
        recordDate: yesterday.toISOString(),
        submissionDate: today.toISOString(),
        field1Amount: 146980.00, // Butchery
        field2Amount: 90820.00,  // Liquor
        totalSales: 237800.00,
        importSource: 'API',
        isLate: false,
        delayReason: ''
      },
      {
        id: 'seed-loop-2',
        systemType: 'LOOP',
        recordDate: threeDaysAgo.toISOString(),
        submissionDate: today.toISOString(),
        field1Amount: 107300.00,
        field2Amount: 47860.00,
        totalSales: 155160.00,
        importSource: 'PDF',
        isLate: true,
        delayReason: 'Monthly physical inventory count delayed supervisor signoff'
      }
    ];

    // Attempt to load from cloud Firestore
    try {
      const cloudEntries = await getFirestoreEntries();
      if (cloudEntries && cloudEntries.length > 0) {
        console.log(`[SalesService] Loaded ${cloudEntries.length} entries from cloud Firestore (elaprojects-3212e)`);
        // Merge cloud entries
        const existingIds = new Set(cloudEntries.map(e => e.id));
        const nonDuplicateMock = this._inMemoryEntries.filter(m => !existingIds.has(m.id));
        this._inMemoryEntries = [...cloudEntries, ...nonDuplicateMock];
      }
    } catch (e) {
      console.warn(`[SalesService] Initial Firestore load fallback: ${e.message}`);
    }

    this._isInitialized = true;
  }

  /**
   * Calendar day late check (identical to Flutter checkIsLate)
   */
  static checkIsLate(docDateInput, submitDateInput) {
    const docDate = new Date(docDateInput);
    const submitDate = new Date(submitDateInput);

    const docDay = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());
    const submitDay = new Date(submitDate.getFullYear(), submitDate.getMonth(), submitDate.getDate());

    const diffMs = submitDay.getTime() - docDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 1;
  }

  /**
   * Save entry into in-memory store and cloud Firestore
   */
  async saveEntry(entryData) {
    await this._initStore();

    const id = entryData.id || uuidv4();
    const recordDate = new Date(entryData.recordDate || new Date());
    const submissionDate = new Date(entryData.submissionDate || new Date());

    const isLate = SalesService.checkIsLate(recordDate, submissionDate);
    
    if (isLate && (!entryData.delayReason || entryData.delayReason.trim().length === 0)) {
      throw new Error('Mandatory delay reason required for submissions delayed by more than 1 day.');
    }

    const field1Amount = Number(entryData.field1Amount) || 0.0;
    const field2Amount = Number(entryData.field2Amount) || 0.0;
    const totalSales = Number(entryData.totalSales) || (field1Amount + field2Amount);

    const newEntry = {
      id,
      systemType: entryData.systemType === 'LOOP' ? 'LOOP' : 'CENET',
      recordDate: recordDate.toISOString(),
      submissionDate: submissionDate.toISOString(),
      field1Amount,
      field2Amount,
      totalSales,
      importSource: entryData.importSource || 'Manual',
      isLate,
      delayReason: entryData.delayReason ? String(entryData.delayReason).trim() : ''
    };

    // 1. Update in-memory list immediately
    this._inMemoryEntries.unshift(newEntry);

    // 2. Start database save to Firestore in the background
    saveFirestoreEntry(newEntry).catch(err => {
      console.warn(`[SalesService] Background Firestore sync notice: ${err.message}`);
    });

    return newEntry;
  }

  /**
   * Fetch entries for CENET or LOOP
   */
  async getEntriesBySystem(systemType) {
    await this._initStore();
    return this._inMemoryEntries
      .filter(e => e.systemType === systemType)
      .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
  }

  /**
   * Fetch all audit log entries
   */
  async getAllEntries() {
    await this._initStore();
    return [...this._inMemoryEntries]
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  }

  /**
   * Calculate summary statistics
   */
  async getStats() {
    await this._initStore();
    const all = this._inMemoryEntries;
    const cenet = all.filter(e => e.systemType === 'CENET');
    const loop = all.filter(e => e.systemType === 'LOOP');
    const late = all.filter(e => e.isLate);

    const totalRevenue = all.reduce((sum, e) => sum + (e.totalSales || 0), 0);
    const cenetTotal = cenet.reduce((sum, e) => sum + (e.totalSales || 0), 0);
    const loopTotal = loop.reduce((sum, e) => sum + (e.totalSales || 0), 0);

    return {
      totalTransactions: all.length,
      totalRevenue,
      cenetTotal,
      loopTotal,
      cenetCount: cenet.length,
      loopCount: loop.length,
      lateSubmissionsCount: late.length,
      onTimePercentage: all.length > 0 ? (((all.length - late.length) / all.length) * 100).toFixed(1) : 100
    };
  }
}

export const salesService = new SalesService();
