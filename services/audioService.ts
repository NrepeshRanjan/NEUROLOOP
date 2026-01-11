
// services/audioService.ts

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.1;

  constructor() {
    // Lazy initialization on first user interaction to comply with browser policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(this.volume, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  public playClick() {
    // High pitched, short sine wave for UI feedback
    this.playTone(800, 'sine', 0.1);
  }

  public playTargetHit() {
    // Harmonious chord for success
    this.playTone(440, 'sine', 0.15, 0);       // A4
    this.playTone(554.37, 'sine', 0.15, 0.05); // C#5
  }

  public playTargetMiss() {
    // Dissonant low frequency for failure
    this.playTone(150, 'sawtooth', 0.2);
    this.playTone(145, 'sawtooth', 0.2);
  }

  public playLevelUp() {
    // Ascending sequence
    this.playTone(440, 'triangle', 0.1, 0);
    this.playTone(554, 'triangle', 0.1, 0.1);
    this.playTone(659, 'triangle', 0.2, 0.2);
  }

  public playStart() {
    // Deep swell
    this.playTone(110, 'sine', 0.5);
  }
}

export const audioService = new AudioService();
