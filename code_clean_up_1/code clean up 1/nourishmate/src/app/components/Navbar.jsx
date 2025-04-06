import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../globals.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/check-auth");
        if (res.ok) {
          const data = await res.json();
          console.log("Check auth response:", data); // Debugging log
          setIsLoggedIn(true);
          setIsAdmin(data.user.isAdmin); // ✅ Correctly access the nested user object
        }
      } catch (error) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <h1 className="navbar__title">NourishMate</h1>
        <ul className="navbar__list">
          <li className="navbar__item">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link href="/about">About</Link>
          </li>
          <li className="navbar__item">
            <Link href="/personalizedMeals">Personalized Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/exploreMeals">Explore Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/budget-tracker">Budget Tracker</Link>
          </li>
          <li className="navbar__item">
            <Link href="/calorie-calculator">Calorie Calculator</Link>
          </li>
          <li className="navbar__item">
            <Link href="/meal-logger" className="hover:text-blue-500">
              Meal Logger
            </Link>
          </li>
          {isAdmin && (
            <li className="navbar__item">
              <Link href="/adminPanel">Admin Panel</Link>
            </li>
          )}
        </ul>
        <div className="navbar__buttons">
          {!isLoggedIn ? (
            <>
              <Link href="/register">
                <button className="navbar__button">Register</button>
              </Link>
              <Link href="/login">
                <button className="navbar__button">Login</button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/account">
                <button className="navbar__button">Account</button>
              </Link>
              <button onClick={handleLogout} className="navbar__button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
