import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../assets/css/main.css';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('Đang hoàn tất đăng nhập bằng Google...');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setIsLoading(false);
                setIsError(true);
                setMessage(decodeURIComponent(errorParam));

                setTimeout(() => {
                    navigate('/');
                }, 3000);
                return;
            }

            try {
                const res = await fetch('/lnhanzi/api/auth/me', {
                    credentials: 'include'
                });
                const data = await res.json();

                if (!res.ok || !data.success || !data.user) {
                    throw new Error(data.message || 'Không xác thực được tài khoản');
                }

                const role = data.user.role;

                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }

            } catch {
                setIsLoading(false);
                setIsError(true);
                setMessage('Đăng nhập thất bại. Đang quay lại...');

                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        };

        handleAuthCallback();
    }, [searchParams, navigate]);

    return (
        <div className="auth-callback-container">
            {isLoading && <div className="spinner"></div>}
            <p className={`msg ${isError ? 'error' : ''}`}>{message}</p>
        </div>
    );
};

export default GoogleCallback;