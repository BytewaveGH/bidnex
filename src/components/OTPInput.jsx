import { useEffect, useMemo, useRef, useState } from "react";

export default function OTPInput({ length = 6, onComplete }) {
  const len = useMemo(() => Math.max(1, Number(length) || 6), [length]);
  const [values, setValues] = useState(() => Array(len).fill(""));
  const inputsRef = useRef([]);

  
  useEffect(() => {
    setValues(Array(len).fill(""));
    inputsRef.current = inputsRef.current.slice(0, len);
  }, [len]);

  useEffect(() => {
    
    inputsRef.current[0]?.focus?.();
  }, []);

  const emitIfComplete = (arr) => {
    const code = arr.join("");
    if (code.length === len && !arr.includes("") && typeof onComplete === "function") {
      onComplete(code);
    }
  };

  const handleChange = (index, raw) => {
    const digits = String(raw || "").replace(/\D/g, "");

    
    if (digits.length > 1) {
      const next = [...values];
      let cursor = index;

      for (const ch of digits) {
        if (cursor >= len) break;
        next[cursor] = ch;
        cursor += 1;
      }

      setValues(next);
      const focusIndex = Math.min(index + digits.length, len - 1);
      inputsRef.current[focusIndex]?.focus?.();
      emitIfComplete(next);
      return;
    }

    const next = [...values];
    next[index] = digits.slice(-1);
    setValues(next);

    if (digits && index < len - 1) {
      inputsRef.current[index + 1]?.focus?.();
    }

    emitIfComplete(next);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      
      if (values[index]) {
        const next = [...values];
        next[index] = "";
        setValues(next);
        return;
      }
      
      if (index > 0) {
        inputsRef.current[index - 1]?.focus?.();
        const next = [...values];
        next[index - 1] = "";
        setValues(next);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus?.();
    }
    if (e.key === "ArrowRight" && index < len - 1) {
      inputsRef.current[index + 1]?.focus?.();
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text") || "";
    handleChange(index, text);
  };

  return (
    <div className="flex gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={len} 
          className="h-12 w-12 rounded-xl border border-gray-200 bg-white text-center text-lg font-semibold outline-none focus:border-gray-900"
        />
      ))}
    </div>
  );
}