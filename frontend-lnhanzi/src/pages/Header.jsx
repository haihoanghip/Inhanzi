import '../assets/css/base.css';
import '../assets/css/main.css';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

function Header({ activeModal, openModal, closeModal }) {
    const [isLight, setIsLight] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isLight) {
            root.classList.add("light-mode");
        } else {
            root.classList.remove("light-mode");
        }
        localStorage.setItem("theme", isLight ? "light" : "dark");
    }, [isLight]);

    const handleThemeToggle = (e) => {
        setIsLight(e.target.checked);
    };

    const toggleMenu = () => {
        console.log("Đã bấm vào nút menu hamburger");
        const menu = document.getElementById("mobileMenu");
        const hamburger = document.querySelector(".hamburger");
        const overlay = document.getElementById("overlay");

        menu.classList.toggle("active");
        hamburger.classList.toggle("active");
        overlay.classList.toggle("active");
    };

    return (
        <>
            <div className="header">
                <nav className='header__navbar'>
                    <ul className='header__navbar--list'>
                        <li className="nav-left">
                            <a className="logo" href="/">
                                <span className="logo-zh">漢</span>
                                <p className='logo-ch'>HSK Learning</p>
                            </a>
                        </li>
                        <li className="nav-right">
                            <label className="toggle-switch">
                                <input type="checkbox" id='toggle-btn'
                                    checked={isLight}
                                    onChange={handleThemeToggle} />
                                <span className="slider"></span>
                            </label>

                            <button className="btn-login" onClick={() => openModal('login')}>Đăng nhập</button>
                            <div className="hamburger" onClick={toggleMenu}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </li>
                    </ul>
                </nav>
                <AuthModal
                    isOpen={activeModal !== null}
                    type={activeModal}
                    onClose={closeModal}
                />
            </div>

            <div className="mobile-menu" id="mobileMenu">
                <button className="btn-login" onClick={() => openModal('login')}>
                    Đăng nhập
                </button>

                <button className="btn-register" onClick={() => openModal('register')}>
                    Đăng ký
                </button>

                <div className="mobile-toggle">
                    <p style={{ fontSize: '1.1rem', color: 'white' }}>
                        SÁNG | TỐI
                    </p>
                    <label className="toggle-switch">
                        <input type="checkbox" id='toggle-btn'
                            checked={isLight}
                            onChange={handleThemeToggle} />
                        <span className="slider"></span>
                    </label>
                </div>

                <a className="nav-link" href="/">ĐẦU TRANG</a>
                <a className="nav-link" href="#courses">KHÓA HỌC</a>
                <a className="nav-link" href="#features">TÍNH NĂNG</a>
                <a className="nav-link" href="../public/page/help.html">GIÚP ĐỠ</a>
            </div>

            <div className="overlay" id="overlay" onClick={toggleMenu}></div>
        </>
    );
}

export default Header;
