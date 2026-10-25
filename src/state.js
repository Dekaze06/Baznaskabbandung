/**
 * BAZNAS Kabupaten Bandung - Amanah Civic Governance SaaS
 * Central Reactive State & Persistence
 */

export const INITIAL_STATE = {
  totalCollection: 18420500000,
  targetRKAT: 21300000000,
  nisabEmasTahun: 82350000,
  nisabEmasGram: 1350000,
  activeRole: 'pimpinan',
  activeRoute: 'command-center',
  isPublicMode: false,
  pendingApprovals: 8,
  upzCount: 487,
  simbaOnline: true,
  roles: {
    pimpinan: {
      name: 'Drs. H. M. Yusuf',
      title: 'Ketua BAZNAS RI-3204',
      badge: 'Pimpinan & Otoritas',
      defaultRoute: 'command-center'
    },
    keuangan: {
      name: 'H. Asep Supriatna, S.E., Ak.',
      title: 'Kepala Bagian Keuangan & PSAK 109',
      badge: 'Akuntan Amil',
      defaultRoute: 'keuangan'
    },
    surveyor: {
      name: 'Ahmad Fauzi, S.Sos.',
      title: 'Koordinator Verifikator Lapangan',
      badge: 'Divisi Pendistribusian',
      defaultRoute: 'asesmen'
    },
    upz: {
      name: 'Drs. H. Dedi Kusnadi',
      title: 'Ketua UPZ Disdik Kab. Bandung',
      badge: 'Bendahara UPZ OPD',
      defaultRoute: 'upz'
    },
    muzaki: {
      name: 'Muzaki / Donatur Dermawan',
      title: 'Portal Layanan Publik',
      badge: 'Masyarakat',
      defaultRoute: 'transparansi'
    }
  }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem('baznas_saas_state');
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : { ...INITIAL_STATE };
    } catch {
      return { ...INITIAL_STATE };
    }
  }

  saveState() {
    try {
      localStorage.setItem('baznas_saas_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  get() {
    return this.state;
  }

  set(partial) {
    this.state = { ...this.state, ...partial };
    this.saveState();
    this.notify();
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  recordPayment(amount, type, muzakiName, method) {
    const newTotal = this.state.totalCollection + Number(amount);
    this.set({ totalCollection: newTotal });
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('baznas:payment-recorded', {
      detail: { amount, type, muzakiName, method, newTotal }
    }));
  }
}

export const appState = new StateManager();
