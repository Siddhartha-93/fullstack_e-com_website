import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import SiteHeader from "../components/layout/Header.jsx";
import SiteFooter from "../components/layout/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  login as loginUser,
  register as registerUser,
} from "../api/authApi.js";

const socialProviders = [
  {
    label: "Continue with Google",
    icon: GoogleIcon,
    className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  },
  {
    label: "Continue with WhatsApp",
    icon: WhatsappIcon,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
];

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useMemo(
    () => (location.pathname.includes("/signup") ? "signup" : "login"),
    [location.pathname],
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (mode === "signup" && !form.name.trim()) {
      next.name = "Full name is required.";
    }
    if (mode === "signup" && !form.email.trim()) {
      next.email = "Email is required.";
    }
    if (!form.phone.trim()) {
      next.phone = "Mobile number is required.";
    }
    if (!form.password.trim()) {
      next.password = "Password is required.";
    }
    if (mode === "signup" && !form.confirmPassword.trim()) {
      next.confirmPassword = "Please confirm your password.";
    }
    if (
      mode === "signup" &&
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setApiError('');
    setIsSubmitting(true);

    try {
      const payload = {
        phone: form.phone,
        password: form.password,
      };

      let response;
      if (mode === "signup") {
        response = await registerUser({
          ...payload,
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        response = await loginUser(payload);
      }

      auth.login(response.data.token, response.data.user);
      navigate(response.data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error.message ||
          "Authentication failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.15),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),transparent_25%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-16">
        {/* left side */}
        <section className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-card backdrop-blur-xl lg:mt-0 lg:w-[520px] lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {mode === "login" ? "Member access" : "Sign up"}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </h2>
            </div>
            {/* 
            ----- Admin login button hidden for normal users; visible only on login page
             */}
            {/* <Button
              variant="ghost"
              size="sm"
              className="rounded-full border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
              onPress={() => navigate('/admin/login')}
              startContent={<AdminIcon />}
            >
              Admin
            </Button>  */}
          </div>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}
            {mode === "signup" && (
              <FloatingInput
                label="Full name"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
                icon={UserIcon}
                placeholder="Enter your name"
              />
            )}
            {mode === "signup" && (
              <FloatingInput
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
                icon={MailIcon}
                placeholder="you@example.com"
                type="email"
              />
            )}
            {/* Role selector hidden for normal users; role defaults to 'customer' */}
            <FloatingInput
              label="Mobile number"
              value={form.phone}
              onChange={handleChange("phone")}
              error={errors.phone}
              icon={PhoneIcon}
              placeholder="e.g. +91 98765 43210"
              inputMode="tel"
            />
            <FloatingInput
              label="Password"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
              icon={LockIcon}
              placeholder="********"
              type={showPassword ? "text" : "password"}
              trailing={
                <button
                  type="button"
                  className="text-slate-500 transition hover:text-slate-700"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            {mode === "signup" && (
              <FloatingInput
                label="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
                icon={LockIcon}
                placeholder="Repeat your password"
                type={showPassword ? "text" : "password"}
              />
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {mode === "login" ? (
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary transition hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              ) : (
                <div className="text-sm text-slate-500">
                  Secure password, strong orders.
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold"
                disabled={isSubmitting}
              >
                {mode === "login" ? "Log in" : "Create account"}
              </Button>
            </div>
          </form>
          <div className="relative py-3 text-center text-sm text-slate-500">
            <span className="absolute left-4 right-4 top-1/2 h-px bg-slate-200" />
            <span className="relative bg-white px-3">Or continue with</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialProviders.map((provider) => (
              <button
                key={provider.label}
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${provider.className}`}
              >
                <provider.icon className="h-5 w-5" />
                {provider.label}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-center text-sm text-slate-600">
              {mode === "login"
                ? "New to Fresh Bite?"
                : "Already have an account?"}{" "}
              <Link
                to={mode === "login" ? "/signup" : "/login"}
                className="font-semibold text-primary transition hover:text-primary/80"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </Link>
            </p>
          </div>
        </section>

        {/* right side */}
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-card backdrop-blur-xl lg:flex-1 lg:min-w-[44%] lg:p-12">
          <div className="max-w-xl space-y-8 p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fresh-200 via-fresh-100 to-fresh-200 px-3 py-1 text-sm font-semibold text-fresh-900">
              {mode === "login" ? "Welcome back" : "New here?"}
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {mode === "login"
                  ? "Log in to your account"
                  : "Create your account"}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {mode === "login"
                  ? "Sign in with your mobile number and password, or choose a secure social login option."
                  : "Start ordering fresh chicken and track your cart with a secure account. It only takes a few seconds."}
              </p>
            </div>
            <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <FeatureItem
                label="Fast checkout"
                description="Secure mobile-first login."
              />
              <FeatureItem
                label="Easy support"
                description="WhatsApp help available."
              />
              <FeatureItem
                label="Trustworthy"
                description="Strong password guidance."
              />
              <FeatureItem
                label="Responsive"
                description="Looks great on mobile and desktop."
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FloatingInput({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  trailing,
}) {
  return (
    <label className="block">
      <span className="mb-2 inline-block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500">
          <Icon className="h-5 w-5" />
        </span>
        <input
          value={value}
          onChange={onChange}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50/90 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
        {trailing && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {trailing}
          </span>
        )}
      </div>
      {error && (
        <span className="mt-2 block text-sm font-medium text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function FeatureItem({ label, description }) {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function AdminIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2L4 6v6c0 5.25 3.87 9.67 8 10 4.13-.33 8-4.75 8-10V6l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6M9 16h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21.35 11.1h-9.2v2.72h5.26c-.23 1.25-.93 2.3-1.98 3.01v2.5h3.2c1.88-1.74 2.96-4.3 2.96-7.44 0-.56-.05-1.1-.13-1.63z"
        fill="#4285F4"
      />
      <path
        d="M12.15 21c2.7 0 4.97-.9 6.62-2.44l-3.2-2.5c-.9.6-2.05.95-3.42.95-2.62 0-4.84-1.76-5.63-4.13H3.24v2.58A9.04 9.04 0 0 0 12.15 21z"
        fill="#34A853"
      />
      <path
        d="M6.52 12.88a5.43 5.43 0 0 1 0-3.48V6.82H3.24a9.03 9.03 0 0 0 0 10.35l3.28-2.29z"
        fill="#FBBC05"
      />
      <path
        d="M12.15 6.32c1.47 0 2.8.51 3.84 1.51l2.88-2.88C17.08 3.2 14.82 2.25 12.15 2.25c-4.6 0-8.49 3.05-9.89 7.34l3.28 2.58c.8-2.37 3.01-4.13 5.63-4.13z"
        fill="#EA4335"
      />
    </svg>
  );
}

function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.04c-5.49 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.34 4.94L2 22l5.23-1.37a9.92 9.92 0 0 0 4.77 1.18c5.49 0 9.96-4.46 9.96-9.96S17.49 2.04 12 2.04Z"
        fill="#25D366"
      />
      <path
        d="M17.26 14.88c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.57.12-.17.25-.66.8-.81.96-.15.17-.3.19-.55.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.38.11-.5.12-.12.26-.31.39-.47.13-.17.17-.29.25-.48.08-.18.04-.35-.02-.48-.06-.12-.57-1.38-.78-1.89-.21-.5-.43-.43-.57-.44-.15-.01-.33-.01-.51-.01s-.48.07-.73.35c-.25.29-.96.94-.96 2.3 0 1.35.98 2.66 1.11 2.84.12.17 1.92 2.94 4.65 4.12.65.28 1.16.45 1.56.58.65.22 1.24.19 1.71.12.52-.08 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.12-.23-.18-.48-.3Z"
        fill="#fff"
      />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m17.6 14.3-3.5-.9a1 1 0 0 0-1 .27l-1.5 1.5a15.05 15.05 0 0 1-6.4-6.4l1.5-1.5a1 1 0 0 0 .27-1L9.7 6.4a1 1 0 0 0-1-.7H5.5A1.5 1.5 0 0 0 4 7.2C4 14.1 9.9 20 16.8 20a1.5 1.5 0 0 0 1.5-1.5v-3.2a1 1 0 0 0-.7-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6.5C4 5.12 5.12 4 6.5 4h11c1.38 0 2.5 1.12 2.5 2.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 6.75 12 11.25l6.5-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="6"
        y="11"
        width="12"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M17.94 17.94A10.95 10.95 0 0 1 12 19c-7 0-11-7-11-7 .84-1.9 2.16-3.58 3.86-4.85"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 12s-4 7-11 7a10.95 10.95 0 0 1-5.94-1.94"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1l22 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
