import { useState, useRef } from 'react';
import '../assets/css/base.css';
import '../assets/css/main.css';
import { loginUser, registerUser } from '../api/auth';

function AuthModal({ isOpen, type, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [strengthWidth, setStrengthWidth] = useState('0%');
    const [strengthColor, setStrengthColor] = useState('#ccc');
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
    const [loading, setLoading] = useState(false);

    const loginEmailRef = useRef();
    const loginPasswordRef = useRef();
    const regUsernameRef = useRef();
    const regEmailRef = useRef();
    const regPasswordRef = useRef();
    const regConfirmRef = useRef();

    if (!isOpen || !type) return null;

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

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
        setLoading(true);
        try {
            const data = await loginUser({
                email: loginEmailRef.current.value,
                password: loginPasswordRef.current.value,
            });

            if (data.success) {
                showToast('success', data.message || 'Đăng nhập thành công!');
                setTimeout(() => {
                    onClose();
                    if (data.redirect_url) window.location.href = data.redirect_url;
                }, 1200);
            } else {
                // Hiển thị lỗi validation hoặc message từ server
                if (data.errors) {
                    const errMsg = Object.values(data.errors).join(' • ');
                    showToast('error', errMsg);
                } else {
                    showToast('error', data.message || 'Đăng nhập thất bại.');
                }
            }
        } catch {
            showToast('error', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        const password = regPasswordRef.current.value;
        const confirm = regConfirmRef.current.value;

        if (password !== confirm) {
            showToast('error', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            const data = await registerUser({
                first_name: regUsernameRef.current.value,
                email: regEmailRef.current.value,   // ✅ FIX: dùng đúng ref email
                password,
                password_confirm: confirm,
            });

            if (data.success) {
                showToast('success', data.message || 'Tạo tài khoản thành công!');
                setTimeout(() => {
                    onClose();
                    if (data.redirect_url) window.location.href = data.redirect_url;
                }, 1200);
            } else {
                if (data.errors) {
                    const errMsg = Object.values(data.errors).join(' • ');
                    showToast('error', errMsg);
                } else {
                    showToast('error', data.message || 'Đăng ký thất bại.');
                }
            }
        } catch {
            showToast('error', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // ✅ FIX: Google dùng GET redirect, không phải fetch POST
        const apiBase = import.meta.env.VITE_API_URL;
        window.location.href = `${apiBase}/auth/google`;
    };

    const toastStyle = {
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 9999,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        transition: 'opacity 0.3s',
        backgroundColor: toast?.type === 'success' ? '#2ecc71' : '#e74c3c',
        color: '#fff',
    };

    return (
        <>
            {/* MODAL ĐĂNG NHẬP */}
            {type === 'login' && (
                <div className="modal-overlay" onClick={() => onClose()}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>

                        {/* Toast thông báo */}
                        {toast && <div style={toastStyle}>{toast.message}</div>}

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
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                            <div className="form-divider"><span>hoặc</span></div>
                            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>

                        {/* Toast thông báo */}
                        {toast && <div style={toastStyle}>{toast.message}</div>}

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
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                            </button>
                            <div className="form-divider"><span>hoặc</span></div>
                            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
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