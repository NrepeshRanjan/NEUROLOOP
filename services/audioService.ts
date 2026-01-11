
// services/audioService.ts

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Pentatonic Scale (C Minor) for "Neuro" feel: C, Eb, F, G, Bb
  private scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25];
  private currentNoteIndex = 0;

  constructor() {
    // Lazy init
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Default volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setMuted(this.isMuted);
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // --- SYNTHESIS ENGINE ---

  private playOscillator(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 1) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    // Envelope (Attack -> Decay)
    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + startTime + 0.02); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration + 0.1);
  }

  public playClick() {
    this.init();
    // Crisp UI click (high sine)
    this.playOscillator(1200, 'sine', 0.05, 0, 0.2);
  }

  public playTargetHit() {
    this.init();
    // Play next note in scale
    const freq = this.scale[this.currentNoteIndex % this.scale.length];
    this.currentNoteIndex++;
    
    // Layered sound for richness
    this.playOscillator(freq, 'sine', 0.3, 0, 0.5);
    this.playOscillator(freq * 0.5, 'triangle', 0.3, 0, 0.2); // Sub-bass harmonic
  }

  public playTargetMiss() {
    this.init();
    this.currentNoteIndex = 0; // Reset combo
    // Dissonant error sound
    this.playOscillator(150, 'sawtooth', 0.4, 0, 0.4);
    this.playOscillator(145, 'sawtooth', 0.4, 0.05, 0.4); // Detuned
  }

  public playRuleShift(silent: boolean = false) {
    this.init();
    if (silent) {
       // "Subliminal" low frequency sweep - barely audible but felt
       if (!this.ctx || !this.masterGain) return;
       const osc = this.ctx.createOscillator();
       const gain = this.ctx.createGain();
       osc.frequency.setValueAtTime(60, this.ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.5);
       gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
       osc.connect(gain);
       gain.connect(this.masterGain);
       osc.start();
       osc.stop(this.ctx.currentTime + 1.5);
    } else {
       // Overt shift sound (phaser-like)
       this.playOscillator(880, 'sine', 0.8, 0, 0.1);
       this.playOscillator(440, 'square', 0.8, 0.1, 0.05);
    }
  }

  public playStart() {
    this.init();
    this.currentNoteIndex = 0;
    // Power up sweep
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public playLevelUp() {
    this.init();
    // Celebratory arpeggio
    this.playOscillator(523.25, 'sine', 0.2, 0, 0.4); // C5
    this.playOscillator(659.25, 'sine', 0.2, 0.1, 0.4); // E5
    this.playOscillator(783.99, 'sine', 0.4, 0.2, 0.4); // G5
  }
}

export const audioService = new AudioService();
