import API_BASE from './config';

export const loginUser = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const registerUser = async ({ username, email, password }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
    return res.json();
};

export const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
};