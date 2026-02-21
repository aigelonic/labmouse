/**
 * SoundManager handles all game sound effects using Web Audio API.
 * Uses programmatic sounds (oscillators) to avoid needing external audio files.
 */

export class SoundManager {
  private audioContext?: AudioContext;
  private initialized = false;

  /**
   * Initialize the audio context. Must be called after user gesture.
   */
  init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Check if sound is enabled and initialized.
   */
  isEnabled(): boolean {
    return this.initialized && this.audioContext !== undefined;
  }

  /**
   * Play a short blip sound when player moves.
   */
  playMove(): void {
    if (!this.isEnabled() || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Short 440Hz tone (A4 note)
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';

    // Quick fade out
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  /**
   * Play a success chime when cheese is collected.
   */
  playCollect(): void {
    if (!this.isEnabled() || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Two-tone rising chime
    this.playTone(523.25, now, 0.1, 0.15); // C5
    this.playTone(659.25, now + 0.1, 0.15, 0.15); // E5
  }

  /**
   * Play a victory fanfare when game is won.
   */
  playWin(): void {
    if (!this.isEnabled() || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Victory melody
    this.playTone(523.25, now, 0.15, 0.1); // C5
    this.playTone(659.25, now + 0.15, 0.15, 0.1); // E5
    this.playTone(783.99, now + 0.3, 0.2, 0.15); // G5
  }

  /**
   * Helper to play a single tone.
   */
  private playTone(frequency: number, startTime: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope: quick attack, sustain, quick release
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01); // Attack
    gainNode.gain.setValueAtTime(volume, startTime + duration - 0.05); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Release

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Clean up audio context.
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
      this.initialized = false;
    }
  }
}
