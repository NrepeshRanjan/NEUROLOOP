
// services/audioService.ts

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Drone Nodes
  private droneOsc: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null; // Binaural layer
  private droneGain: GainNode | null = null;
  private droneLFO: OscillatorNode | null = null;

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

  // --- DRONE ENGINE ---
  public startDrone() {
    if (this.isMuted || !this.ctx || this.droneOsc) return;
    this.init();
    if (!this.masterGain) return;

    const t = this.ctx.currentTime;

    // Layer 1: Base drone (Triangle)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'triangle';
    this.droneOsc.frequency.setValueAtTime(55, t); // A1 (Low)

    // Layer 2: Binaural Detune (Sine) - Creates a 0.5Hz beat for "Neuro" focus
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.5, t); 

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, t);
    this.droneGain.gain.linearRampToValueAtTime(0.08, t + 2); // Slow fade in

    // LFO for movement (Throb effect)
    this.droneLFO = this.ctx.createOscillator();
    this.droneLFO.type = 'sine';
    this.droneLFO.frequency.setValueAtTime(0.1, t); // Very slow cycle
    
    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    
    this.droneLFO.connect(filter.frequency);
    
    this.droneOsc.connect(filter);
    this.droneOsc2.connect(filter);
    
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start(t);
    this.droneOsc2.start(t);
    this.droneLFO.start(t);
  }

  public stopDrone() {
    if (this.droneOsc) {
       const t = this.ctx!.currentTime;
       // Fade out
       if (this.droneGain) {
           this.droneGain.gain.cancelScheduledValues(t);
           this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
           this.droneGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
       }
       this.droneOsc.stop(t + 1);
       this.droneOsc2?.stop(t + 1);
       this.droneLFO?.stop(t + 1);
       
       this.droneOsc = null;
       this.droneOsc2 = null;
       this.droneGain = null;
       this.droneLFO = null;
    }
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
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + startTime + 0.01); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration + 0.1);
  }

  public playClick() {
    this.init();
    this.playOscillator(1200, 'sine', 0.05, 0, 0.2);
  }

  public playOrbitSwitch() {
    this.init();
    // Whoosh up
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playFluxFlip() {
    this.init();
    // Magnetic snap (metallic)
    this.playOscillator(2000, 'triangle', 0.1, 0, 0.3);
    this.playOscillator(4000, 'sine', 0.05, 0, 0.1);
  }

  public playGatherCatch() {
    this.init();
    // Soft, water-like bloop for gathering
    this.playOscillator(400, 'sine', 0.1, 0, 0.3);
    this.playOscillator(600, 'sine', 0.1, 0.05, 0.1);
  }

  public playPhaseSync() {
    this.init();
    // Harmonic resonance (Major chord sweep)
    this.playOscillator(440, 'sine', 0.5, 0, 0.3); // A4
    this.playOscillator(554.37, 'sine', 0.5, 0.05, 0.2); // C#5
    this.playOscillator(659.25, 'sine', 0.5, 0.1, 0.2); // E5
  }

  public playTargetHit() {
    this.init();
    // Play next note in scale
    const freq = this.scale[this.currentNoteIndex % this.scale.length];
    this.currentNoteIndex++;
    
    // Layered sound for richness
    this.playOscillator(freq, 'sine', 0.3, 0, 0.4);
    this.playOscillator(freq * 0.5, 'triangle', 0.3, 0, 0.2); // Sub-bass harmonic
  }

  public playTargetMiss() {
    this.init();
    this.currentNoteIndex = 0; // Reset combo
    // Dissonant error sound
    this.playOscillator(150, 'sawtooth', 0.4, 0, 0.3);
    this.playOscillator(145, 'sawtooth', 0.4, 0.05, 0.3); // Detuned
  }

  public playGameOver() {
    this.init();
    this.stopDrone();
    // Slow descent
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
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
