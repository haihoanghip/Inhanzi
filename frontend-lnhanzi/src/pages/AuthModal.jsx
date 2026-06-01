import { useState, useRef } from 'react';
import '../assets/css/base.css';
import '../assets/css/main.css';
import { loginUser, registerUser, loginWithGoogle } from '../api/auth';

function AuthModal({ isOpen, type, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [strengthWidth, setStrengthWidth] = useState('0%');
    const [strengthColor, setStrengthColor] = useState('#ccc');

    const loginEmailRef = useRef();
    const loginPasswordRef = useRef();
    const regUsernameRef = useRef();
    const regEmailRef = useRef();
    const regPasswordRef = useRef();
    const regConfirmRef = useRef();

    if (!isOpen || !type) return null;

    const handleStrengthCheck = (password) => {
        if (!password) { setStrengthWidth('0%'); return; }
        let score = 0;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        setStrengthWidth(`${score}%`);
        if (score <= 25) setStrengthColor('#ff4d4d');
        else if (score <= 75) setStrengthColor('#ffa500');
        else setStrengthColor('#2ecc71');
    };

    const handleLogin = async () => {
        const data = await loginUser({
            email: loginEmailRef.current.value,
            password: loginPasswordRef.current.value,
        });
        console.log('Login response:', data);
    };

    const handleRegister = async () => {
        const password = regPasswordRef.current.value;
        const confirm = regConfirmRef.current.value;
        if (password !== confirm) {
            alert('Mật khẩu không khớp!');
            return;
        }
        const data = await registerUser({
            username: regUsernameRef.current.value,
            email: regEmailRef.current.value,
            password,
        });
        console.log('Register response:', data);
    };

    return (
        <>
            {/* MODAL ĐĂNG NHẬP */}
            {type === 'login' && (
                <div className="modal-overlay" onClick={() => onClose()}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <div>
                                <div className="modal-groupheader">
                                    <div className="modal-zh">登入</div>
                                    <div className="modal-title">Đăng nhập</div>
                                </div>
                                <div className="modal-sub">Chào mừng bạn trở lại</div>
                            </div>
                            <button className="modal-close" onClick={() => onClose()}>✕</button>
                        </div>

                        <form className="modal-body" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    ref={loginEmailRef}
                                    type="email"
                                    className="auth-form__input"
                                    placeholder="Nhập email của bạn"
                                    autoComplete="username"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <div className="from-groupeye">
                                    <input
                                        ref={loginPasswordRef}
                                        type={showPassword ? 'text' : 'password'}
                                        className="auth-form__input"
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="current-password"
                                    />
                                    <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? '🙈' : '🙉'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', margin: '20px 0' }}>
                                <a style={{ fontSize: '13px', color: 'var(--gold-light)', textDecoration: 'none', cursor: 'pointer' }}
                                    href="/forgotpassword">Quên mật khẩu?</a>
                            </div>
                            <button type="submit" className="btn-submit">Đăng nhập</button>
                            <div className="form-divider"><span>hoặc</span></div>
                            <button type="button" className="btn-google" onClick={loginWithGoogle}>
                                <span className="google-icon"></span>
                                Tiếp tục với Google
                            </button>
                        </form>

                        <div className="modal-footer">
                            Chưa có tài khoản?{' '}
                            <a onClick={() => onClose('register')}>Đăng ký miễn phí →</a>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ĐĂNG KÝ */}
            {type === 'register' && (
                <div className="modal-overlay" onClick={() => onClose()}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <div>
                                <div className="modal-groupheader">
                                    <div className="modal-zh">註冊</div>
                                    <div className="modal-title">Tạo tài khoản</div>
                                </div>
                                <div className="modal-sub">Học tiếng Trung miễn phí ngay hôm nay</div>
                            </div>
                            <button className="modal-close" onClick={() => onClose()}>✕</button>
                        </div>

                        <form className="modal-body" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                            <div className="form-group">
                                <label>Tên người dùng</label>
                                <input
                                    ref={regUsernameRef}
                                    type="text"
                                    className="auth-form__input"
                                    placeholder="Nhập tên người dùng"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    ref={regEmailRef}
                                    type="email"
                                    className="auth-form__input"
                                    placeholder="Nhập email của bạn"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <div className="from-groupeye">
                                    <input
                                        ref={regPasswordRef}
                                        type={showPassword ? 'text' : 'password'}
                                        className="auth-form__input"
                                        placeholder="Tối thiểu 8 ký tự"
                                        autoComplete="new-password"
                                        onChange={(e) => handleStrengthCheck(e.target.value)}
                                    />
                                    <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? '🙈' : '🙉'}
                                    </span>
                                </div>
                                <div className="strength-bar">
                                    <div className="strength-fill" style={{ width: strengthWidth, backgroundColor: strengthColor }}></div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu</label>
                                <input
                                    ref={regConfirmRef}
                                    type="password"
                                    className="auth-form__input"
                                    placeholder="Nhập lại mật khẩu"
                                    autoComplete="new-password"
                                />
                            </div>
                            <button type="submit" className="btn-submit">Tạo tài khoản</button>
                            <div className="form-divider"><span>hoặc</span></div>
                            <button type="button" className="btn-google" onClick={loginWithGoogle}>
                                <span className="google-icon"></span>
                                Đăng ký với Google
                            </button>
                        </form>

                        <div className="modal-footer">
                            Đã có tài khoản?{' '}
                            <a onClick={() => onClose('login')}>Đăng nhập →</a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AuthModal;