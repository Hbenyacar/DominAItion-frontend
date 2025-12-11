// src/utils/sound.ts
export function playSound(path: string, volume = 1) {
  try {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch((err) => {
      console.warn("Sound play blocked:", err);
    });
  } catch (e) {
    console.error("Error playing sound", e);
  }
}
