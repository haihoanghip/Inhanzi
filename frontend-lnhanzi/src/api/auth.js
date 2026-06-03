import API_BASE from './config';

export const loginUser = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const registerUser = async ({ first_name, email, password, password_confirm }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, email, password, password_confirm }),
    });
    return res.json();
};

// Added 'async' right here before the arrow parameters
export const loginWithGoogle = async () => {
    try {
        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data;

    } catch (error) {
        console.log("Google login failed:", error);
        throw error; 
    }
};

export function checkGoogleCallbackError() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam) {
        console.log('Đăng nhập bằng Google thất bại.');
        if (errorParam === 'google_denied') {
            console.log('Bạn đã từ chối cấp quyền đăng nhập bằng Google.');
        } else {
            console.log(decodeURIComponent(errorParam));
        }
    }
}