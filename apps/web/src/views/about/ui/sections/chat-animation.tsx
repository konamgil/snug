'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface TypingTextProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
  className?: string;
}

function TypingText({ text, onComplete, speed = 30, className }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const renderText = () => {
    const parts = displayedText.split('<br />');
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <span className={className}>
      {renderText()}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
}

export function ChatAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [animationKey, setAnimationKey] = useState(0);
  const [step, setStep] = useState(0);
  // Steps:
  // 0: initial
  // 1: message 1 bubble appears
  // 2: message 1 typing
  // 3: message 1 read status appears
  // 4: AI badge + translation appears
  // 5: message 2 bubble appears
  // 6: message 2 typing
  // 7: message 2 read status appears
  // 8: message 3 bubble appears
  // 9: message 3 typing
  // 10: message 3 read status appears
  // 11: complete, wait then restart

  const resetAnimation = useCallback(() => {
    setStep(0);
    setAnimationKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isInView) return;

    // Start animation
    const timer = setTimeout(() => {
      setStep(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [isInView, animationKey]);

  // Handle step transitions
  useEffect(() => {
    if (step === 11) {
      // Wait 2 seconds then restart
      const timer = setTimeout(() => {
        resetAnimation();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, resetAnimation]);

  const handleTypingComplete = (messageNum: number) => {
    // After typing complete, show read status
    setTimeout(() => {
      if (messageNum === 1) {
        setStep(3); // show read status
        setTimeout(() => setStep(4), 250); // show translation
        setTimeout(() => setStep(5), 900); // start message 2
      } else if (messageNum === 2) {
        setStep(7); // show read status
        setTimeout(() => setStep(8), 500); // start message 3
      } else if (messageNum === 3) {
        setStep(10); // show read status
        setTimeout(() => setStep(11), 500); // complete
      }
    }, 100);
  };

  useEffect(() => {
    if (step === 1) {
      setTimeout(() => setStep(2), 150); // start typing
    } else if (step === 5) {
      setTimeout(() => setStep(6), 150); // start typing
    } else if (step === 8) {
      setTimeout(() => setStep(9), 150); // start typing
    }
  }, [step]);

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[420px] h-[440px] md:h-[500px] bg-[#f5f5f5] rounded-[40px] shadow-[0px_10px_20px_0px_rgba(0,0,0,0.18)] p-6 md:p-8"
    >
      <div className="relative h-full overflow-hidden">
        {/* Guest message 1 - Fixed position top */}
        <div className="absolute top-[10px] md:top-[20px] left-0 right-0">
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                key={`msg1-${animationKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-4xl">🧔🏼</span>
                  <span className="text-xs font-bold text-black/80">Guest</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white border border-[#cacaca] rounded-2xl rounded-bl-none p-3"
                    >
                      <p className="text-sm font-medium text-black">
                        {step === 2 ? (
                          <TypingText
                            text="Hello, is this room<br />available?"
                            speed={35}
                            onComplete={() => handleTypingComplete(1)}
                          />
                        ) : step >= 3 ? (
                          <>
                            Hello, is this room
                            <br />
                            available?
                          </>
                        ) : null}
                      </p>
                    </motion.div>
                    {step >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-left flex-shrink-0"
                      >
                        <p className="font-bold text-sm text-black">Read</p>
                        <p className="text-xs text-black">AM 03:06</p>
                      </motion.div>
                    )}
                  </div>
                  {step >= 4 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="mt-2">
                        <span className="bg-[#f65009] text-white text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1">
                          AI Assistance <span>✓</span>
                        </span>
                      </div>
                      <div className="bg-[#ffecda] rounded-2xl rounded-tl-none p-3 mt-2 inline-block">
                        <p className="text-sm font-medium text-black">
                          안녕하세요. 방 예약 가능한가요?
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Response message - Fixed position middle */}
        <div className="absolute top-[170px] md:top-[190px] left-0 right-0">
          <AnimatePresence>
            {step >= 5 && (
              <motion.div
                key={`msg2-${animationKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-end"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#f65009] text-white text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1 mb-2"
                >
                  AI Assistance <span>✓</span>
                </motion.span>
                <div className="flex items-end gap-2">
                  {step >= 7 && (
                    <motion.div
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-right flex-shrink-0"
                    >
                      <p className="font-bold text-sm text-black">Read</p>
                      <p className="text-xs text-black">오전 03:06</p>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#ffecda] rounded-2xl rounded-tr-none p-3"
                  >
                    <p className="text-sm font-medium text-black">
                      {step === 6 ? (
                        <TypingText
                          text="Yes, this room is available!<br />Here are the details..."
                          speed={30}
                          onComplete={() => handleTypingComplete(2)}
                        />
                      ) : step >= 7 ? (
                        <>
                          Yes, this room is available!
                          <br />
                          Here are the details...
                        </>
                      ) : null}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guest message 2 - Fixed position bottom */}
        <div className="absolute top-[280px] md:top-[310px] left-0 right-0">
          <AnimatePresence>
            {step >= 8 && (
              <motion.div
                key={`msg3-${animationKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-4xl">🧔🏼</span>
                  <span className="text-xs font-bold text-black/80">Guest</span>
                </div>
                <div className="flex items-end gap-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border border-[#cacaca] rounded-2xl rounded-bl-none p-3"
                  >
                    <p className="text-sm font-medium text-black">
                      {step === 9 ? (
                        <TypingText
                          text="Thanks!<br />I'll book it!"
                          speed={35}
                          onComplete={() => handleTypingComplete(3)}
                        />
                      ) : step >= 10 ? (
                        <>
                          Thanks!
                          <br />
                          I'll book it!
                        </>
                      ) : null}
                    </p>
                  </motion.div>
                  {step >= 10 && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-left flex-shrink-0"
                    >
                      <p className="font-bold text-sm text-black">Read</p>
                      <p className="text-xs text-black">AM 03:06</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
