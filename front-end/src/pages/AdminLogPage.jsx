import { useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button, Form, Input, Separator } from "@heroui/react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  login as loginUser,
  register as registerUser,
} from "../api/authApi.js";
import { fbLogo } from "../assets/index.js";

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

export default function AdminLogPage() {
  // const [phone, setPhone] = useState("");
  // const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const mode = useMemo(
    () => (location.pathname.includes("/admin/login") ? "login" : "signup"),
    [location.pathname],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isMatch = form.password === form.confirmPassword;
    if (mode === "signup") {
      const userRole = await fetchUsers({ role: form.role});
      // if (userRole?.data?.length > 1) {
      //   setError("User already exists");
      //   return;
      // }
      console.log(userRole?.data?.length, "userRole?.data?.length");
    }
    if (mode === "signup" && !isMatch) {
      setError("Passwords do not match");
      return;
    }
    setError("");

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
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="bg-default-50 flex min-h-screen items-center justify-center p-4">
      <div className="bg-content1 flex w-full max-w-sm flex-col gap-4 rounded-lg p-6 shadow-md">
        <div className="flex items-center  gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            <img src={fbLogo} alt="Fresh Bite Logo" />
          </span>
          <h2 className="text-xl font-medium">
            {mode === "login" ? "Admin login" : "Admin Sign up"}
          </h2>
        </div>
        <Form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {mode === "signup" && (
            <Input
              isRequired
              label="Full Name"
              name="name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Enter your full name"
              variant="bordered"
            />
          )}
          {mode === "signup" && (
            <Input
              isRequired
              label="Email"
              name="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="Enter your Email"
              variant="bordered"
            />
          )}
          <Input
            isRequired
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            placeholder="Enter your phone number"
            type="tel"
            variant="bordered"
          />
          <Input
            isRequired
            label="Password"
            name="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Enter your password"
            type="password"
            variant="bordered"
          />
          {mode === "signup" && (
            <Input
              isRequired
              label="Confirm password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({ ...form, confirmPassword: event.target.value })
              }
              variant="bordered"
              placeholder="Repeat your password"
              type={"text"}
            />
          )}
          <Button className="w-full" color="primary" type="submit">
            {mode === "login" ? "Sign in" : "Sign up"}
          </Button>
        </Form>
        <Separator />
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
        <p className="text-center text-sm text-slate-600 transition-colors">
          {mode === "login" ? "New admin account?" : "have admin account?"}
          <Link
            to={mode === "login" ? "/admin/signup" : "/admin/login"}
            className="ml-1 font-semibold text-primary transition hover:text-primary/80"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
