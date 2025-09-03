"use client";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <Image src="/images/carlogo.png" alt="Car Deposit" width={96} height={32} />
          </div>
          <p className={styles.footerText}>
            Lorem ipsum dolor sit amet consectetur. Mauris eu
            convallis ipsum gravida pretium donec et semper. Sit
            vulputate lorem lorem lorem lorem lorem lorem lorem
            lorem lorem lorem lorem lorem lorem lorem lorem lorem
            aliquam donec leo nibh sit ipsum pulvinar. Quis
            venenatis bibendum et lorem viverra ut mauris.
          </p>
        </div>
        
        <div className={styles.footerCol}>
          <h4>Home</h4>
          <a href="#">Help Center</a>
          <a href="#">FAQ</a>
          <a href="/my-account">My Account</a>
        </div>
        
        <div className={styles.footerCol}>
          <h4>Car Auction</h4>
          <a href="#">Help Center</a>
          <a href="#">FAQ</a>
          <a href="/my-account">My Account</a>
        </div>
        
        <div className={styles.footerCol}>
          <h4>About us</h4>
          <div className={styles.contactInfo}>
            <div>Hot Line Number<br /><strong>+098 421 6644</strong></div>
            <div>Email id:<br /><strong>info@cardeposit.com</strong></div>
            <div>Office No. 5, 6, SABA Plaza, next to ABC Market, London Road, Dubai, United Arab Emirates</div>
          </div>
        </div>
      </div>
      
      <div className={styles.copyright}>
        Copyright 2022 All Rights Reserved
      </div>
    </footer>
  );
}
