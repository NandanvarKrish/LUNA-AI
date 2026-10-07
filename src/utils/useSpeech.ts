import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for Speech Recognition
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export function useSpeech(options?: {
  rate?: number;
  pitch?: number;
  voiceName?: string;
  onTranscript?: (text: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // Check Speech Recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setHasSpeechRecognition(true);
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        let currentText = '';
        for (let i = 0; i < Object.keys(event.results).length; i++) {
          if (event.results[i] && event.results[i][0]) {
            currentText += event.results[i][0].transcript;
          }
        }
        setTranscript(currentText);
        if (options?.onTranscript) {
          options.onTranscript(currentText);
        }
      };

      rec.onerror = (_e: unknown) => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [options]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (_e) {
      // If already started, do nothing
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (_e) {
      // Ignore
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speak = useCallback(
    (text: string, customOptions?: { rate?: number; pitch?: number; voiceName?: string }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Strip code blocks and markdown markers for smoother speech synthesis
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*#_~]/g, '')
        .trim();

      if (!cleanText) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const rate = customOptions?.rate ?? options?.rate ?? 1.0;
      const pitch = customOptions?.pitch ?? options?.pitch ?? 1.0;
      const voiceName = customOptions?.voiceName ?? options?.voiceName;

      utterance.rate = rate;
      utterance.pitch = pitch;

      if (voiceName) {
        const found = voices.find((v) => v.name === voiceName);
        if (found) utterance.voice = found;
      } else {
        // Prefer natural sounding English voices like Google US, Samantha, Karen, or Daniel
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Moira'))
        );
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voices, options]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    voices,
    hasSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    setTranscript,
  };
}
