// app/utils/audio.ts

let audioCtx: AudioContext | null = null;

export const playPageTurnSound = () => {
  try {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const duration = 0.15;
    
    // Create an empty buffer for noise
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // Create a buffer source
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Create a lowpass filter to make it sound like paper (muffled noise)
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    
    // Create an envelope to shape the sound (quick attack, quick release)
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0, audioCtx.currentTime);
    envelope.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    // Connect the graph: noise -> bandpass -> envelope -> destination
    noise.connect(bandpass);
    bandpass.connect(envelope);
    envelope.connect(audioCtx.destination);
    
    // Play the sound
    noise.start();
  } catch (err) {
    console.warn("AudioContext not supported or disabled", err);
  }
};
