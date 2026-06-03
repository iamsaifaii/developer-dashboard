/**
 * Synthesizes a premium, high-quality chime sound using the browser's Web Audio API.
 * This avoids any network calls or external static MP3 files, making it 100% self-contained.
 */
export const playChime = () => {
 try {
 const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioContextClass) return;
 
 const audioCtx = new AudioContextClass();
 
 const playTone = (freq: number, startTime: number, duration: number, volume = 0.25) => {
 const oscillator = audioCtx.createOscillator();
 const gainNode = audioCtx.createGain();
 
 // Use 'sine' wave for a clean glass-like chime tone
 oscillator.type = 'sine';
 oscillator.frequency.setValueAtTime(freq, startTime);
 
 // Smooth attack and decay envelope
 gainNode.gain.setValueAtTime(0, startTime);
 gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.04);
 gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
 
 oscillator.connect(gainNode);
 gainNode.connect(audioCtx.destination);
 
 oscillator.start(startTime);
 oscillator.stop(startTime + duration);
 };

 const now = audioCtx.currentTime;
 
 // Play a premium arpeggiated sound (major 7th chord feel)
 playTone(523.25, now, 0.6, 0.2); // C5
 playTone(659.25, now + 0.12, 0.6, 0.2); // E5
 playTone(783.99, now + 0.24, 0.6, 0.2); // G5
 playTone(987.77, now + 0.36, 0.8, 0.25); // B5
 playTone(1174.66, now + 0.48, 1.2, 0.3); // D6
 } catch (error) {
 console.warn('Web Audio API is blocked or not supported on this browser context', error);
 }
};
