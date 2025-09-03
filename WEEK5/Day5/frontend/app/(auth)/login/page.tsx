"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../styles.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
      // Redirect to homepage after successful login
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.hero}>
        <h1>Login</h1>
        <p>Lorem ipsum dolor sit amet consectetur. At in pretium semper massa volutpat.</p>
        <div className={styles.breadcrumbs}>Home &gt; Login</div>
      </div>

      <div className={styles.tabsWrap}>
        <Link href="/register" className={styles.tab}>Register</Link>
        <Link href="/login" className={`${styles.tab} ${styles.tabActive}`}>Login</Link>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Log In</h3>
        <div className={styles.muted}>New member? <Link href="/register">Register Here</Link></div>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Enter Your Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <div className={styles.row}>
            <label className={styles.checkbox}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Remember me</label>
            <div style={{marginLeft:"auto", color:"#253469", fontWeight:600, cursor:"pointer"}}>Forgot Password</div>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <button className={styles.primaryBtn} disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>

          <div className={styles.orSocial}>Or Register With</div>
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
