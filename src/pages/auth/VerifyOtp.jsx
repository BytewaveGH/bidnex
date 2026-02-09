import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import OTPInput from "../../components/OTPInput";
import verifyImage from "../../assets/images/verify.png";

function formatMMSS(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // phone from signup
  const phone = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("bidchale_signup");
      if (!raw) return "";
      const data = JSON.parse(raw);
      return (data?.phone || "").trim();
    } catch {
      return "";
    }
  }, []);

  // countdown
  const [secondsLeft, setSecondsLeft] = useState(59);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;
  const canVerify = code.length === 6;

  function handleResend() {
    if (!canResend) return;
    setSecondsLeft(59); // later: backend resend
  }

  function handleVerify() {
    if (!canVerify) return;
    navigate("/items");
  }

  return (
    <AuthLayout
      title="Enter Verification Code"
      subtitle={
        <span className="text-gray-600">
          We’ve sent a code to{" "}
          <span className="font-semibold text-gray-900 underline">
            {phone || "your number"}
          </span>
        </span>
      }
      leftImageUrl={verifyImage} 
    >
      <div className="space-y-6">
        <div className="pt-2">
          <OTPInput length={6} onComplete={(c) => setCode(c)} />
        </div>

    
        <div className="text-sm text-gray-600">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-gray-900 underline"
            >
              Resend code
            </button>
          ) : (
            <>
              Resend code in{" "}
              <span className="font-semibold text-gray-900 underline">
                {formatMMSS(secondsLeft)}
              </span>
            </>
          )}
        </div>

        {/* verify button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={!canVerify}
          className={`w-full rounded-xl py-4 text-sm font-semibold transition ${
            canVerify
              ? "bg-gray-900 text-white hover:bg-black"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Verify Account
        </button>
      </div>
    </AuthLayout>
  );
}