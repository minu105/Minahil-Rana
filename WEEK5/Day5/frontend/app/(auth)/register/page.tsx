"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../styles.module.css";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notRobot, setNotRobot] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const fullPhone = `${countryCode} ${phone}`.trim();
      // Generate a mock captcha token when the box is checked to satisfy backend optional field
      const token = notRobot ? (captchaToken || "mock-captcha-token") : undefined;
      await signup({ name, username, email, phone: fullPhone, password, confirmPassword, termsAccepted, captchaToken: token as any });
      // Redirect to homepage after successful registration
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkAvailability() {
    if (!username) return;
    try {
      setUsernameStatus("checking");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/auth/username-available?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameStatus(data?.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.hero}>
        <h1>Register</h1>
        <p>Lorem ipsum dolor sit amet consectetur. At in pretium semper massa volutpat.</p>
        <div className={styles.breadcrumbs}>Home &gt; Register</div>
      </div>

      <div className={styles.tabsWrap}>
        <Link href="/register" className={`${styles.tab} ${styles.tabActive}`}>Register</Link>
        <Link href="/login" className={styles.tab}>Login</Link>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Register</h3>
        <div className={styles.muted}>Do you already have an account? <Link href="/login">Login Here</Link></div>
        <div className={styles.sectionTitle}>Personal Information</div>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Enter Your Full Name" value={name} onChange={(e)=>setName(e.target.value)} />
            <div className={styles.inlineGroup}>
              <input className={styles.input} placeholder="Username" value={username} onChange={(e)=>{setUsername(e.target.value); setUsernameStatus("idle");}} />
              <button type="button" className={styles.inlineLink} onClick={checkAvailability}>Check Availability</button>
            </div>
          </div>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Enter Your Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <div className={styles.phoneGroup}>
              <select className={styles.ccSelect} value={countryCode} onChange={(e)=>setCountryCode(e.target.value)}>
                <option value="+91">India [+91]</option>
                <option value="+92">Pakistan [+92]</option>
                <option value="+1">USA [+1]</option>
                <option value="+44">UK [+44]</option>
              </select>
              <input className={styles.input} placeholder="Enter Mobile Number" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
          </div>
          <div className={styles.sectionTitle}>Account Information</div>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <input className={styles.input} placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
          </div>

          {usernameStatus !== "idle" && (
            <div className={usernameStatus === "available" ? styles.goodNote : styles.badNote}>
              {usernameStatus === "checking" ? "Checking availability..." : usernameStatus === "available" ? "Username is available" : "Username is already taken"}
            </div>
          )}

          <div className={styles.sectionTitle}>Prove You Are Human</div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={notRobot}
              onChange={e=>{ setNotRobot(e.target.checked); setCaptchaToken(e.target.checked ? "mock-captcha-token" : undefined); }}
            />
            I'm not a robot
          </label>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} />
            I agree to the Terms & Conditions
          </label>
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className={styles.primaryBtn} disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>

          <div className={styles.orSocial}>Or Login With</div>
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}>G</button>
            <button type="button" className={styles.socialBtn}>F</button>
            <button type="button" className={styles.socialBtn}>T</button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
