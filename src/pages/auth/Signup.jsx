import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import signupImage from "../../assets/images/signup-image.png";

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: "Poor", idx: 0, segments: 2 };
  if (score <= 3) return { level: "Average", idx: 1, segments: 4 };
  return { level: "Strong password", idx: 2, segments: 6 };
}

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  function handleSubmit(e) {
    e.preventDefault();

    const signupInfo = { email, phone, password };
    sessionStorage.setItem("bidchale_signup", JSON.stringify(signupInfo));

    navigate("/auth/verify");
  }

  return (
    <AuthLayout
      title="Let’s Get You Started!"
      subtitle={
        <>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-gray-900 underline"
          >
            Sign In
          </Link>
        </>
      }
      leftImageUrl={signupImage}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Samuel@example.com"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+233 555 888111"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>

          <div className="mt-2 relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPwd ? "text" : "password"}
              placeholder="Create a strong password"
              className="w-full rounded-xl border border-gray-900/80 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-gray-900 placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10.58 10.58A2 2 0 0013.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => {
                  const active = i < strength.segments;
                  const activeClass =
                    strength.idx === 0
                      ? "bg-red-600"
                      : strength.idx === 1
                        ? "bg-orange-500"
                        : "bg-green-600";

                  return (
                    <span
                      key={i}
                      className={`h-1.5 w-8 rounded-full ${
                        active ? activeClass : "bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>

              <div
                className={`mt-2 text-xs font-semibold ${
                  strength.idx === 0
                    ? "text-red-600"
                    : strength.idx === 1
                      ? "text-orange-500"
                      : "text-green-600"
                }`}
              >
                {strength.level}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl py-4 text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-black hover:opacity-95"
        >
          Sign Up
        </button>
      </form>
    </AuthLayout>
  );
}
