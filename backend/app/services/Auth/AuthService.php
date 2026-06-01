<?php

namespace App\Services\Auth;

use App\Config\JWT;
use App\Models\LoginLog;
use App\Models\User;

class AuthService
{
    private User     $user;
    private LoginLog $loginLog;
    private int  $jwtExpiry;
    private int  $refreshExpiry;

    public function __construct()
    {
        $this->user          = new User();
        $this->loginLog      = new LoginLog();
        $this->jwtExpiry     = (int) ($_ENV['JWT_EXPIRY']         ?? 3600);
        $this->refreshExpiry = (int) ($_ENV['JWT_REFRESH_EXPIRY'] ?? 604800);
    }

    // ─── Đăng ký ─────────────────────────────────────────────────────────────

    public function register(string $firstName, string $email, string $password): array
    {
        if ($this->user->findByEmail($email)) {
            return ['success' => false, 'message' => 'Email đã được sử dụng.'];
        }

        $userId = $this->user->create([
            'first_name'  => $firstName,
            'email'       => $email,
            'password'    => password_hash($password, PASSWORD_BCRYPT),
            'is_verified' => 0,
        ]);

        $tokens = $this->generateTokens($userId, $email, 'user', $firstName);

        return array_merge([
            'success' => true,
            'message' => 'Đăng ký thành công!',
            'user'    => $this->safeUser($this->user->findById($userId)),
        ], $tokens);
    }

    // ─── Đăng nhập ───────────────────────────────────────────────────────────

    public function login(string $email, string $password): array
    {
        $user = $this->user->findByEmail($email);

        if (!$user) {
            return ['success' => false, 'message' => 'Email hoặc mật khẩu không đúng.'];
        }

        if ((int)($user['is_locked'] ?? 0) === 1) {
            return [
                'success' => false,
                'message' => 'Tài khoản đã bị khóa.'
            ];
        }

        // Tài khoản chỉ dùng Google, chưa có password
        if (empty($user['password'])) {
            return ['success' => false, 'message' => 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút "Tiếp tục với Google".'];
        }

        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Email hoặc mật khẩu không đúng.'];
        }

        $tokens = $this->generateTokens($user['id'], $user['email'], $user['role'], $user['first_name'] ?? '', $user['avatar'] ?? null);

        // Ghi log đăng nhập
        $this->loginLog->log($user['id']);

        return array_merge([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'user'    => $this->safeUser($user),
        ], $tokens);
    }

    // ─── Đăng xuất ───────────────────────────────────────────────────────────

    public function logout(string $refreshToken): array
    {
        $this->user->deleteRefreshToken($refreshToken);
        return ['success' => true, 'message' => 'Đã đăng xuất.'];
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────

    public function refresh(string $refreshToken): array
    {
        $record = $this->user->findRefreshToken($refreshToken);
        if (!$record) {
            return ['success' => false, 'message' => 'Refresh token không hợp lệ hoặc đã hết hạn.'];
        }

        $user = $this->user->findById($record['user_id']);
        if (!$user) {
            return ['success' => false, 'message' => 'Người dùng không tồn tại.'];
        }

        // Xoay vòng refresh token (rotation)
        $this->user->deleteRefreshToken($refreshToken);
        $tokens = $this->generateTokens($user['id'], $user['email'], $user['role'], $user['first_name'] ?? '', $user['avatar'] ?? null);

        return array_merge(['success' => true, 'user' => $this->safeUser($user)], $tokens);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    public function generateTokens(int $userId, string $email, string $role, string $firstName = '', ?string $avatar = null): array
    {
        $accessToken  = JWT::encode([
            'sub'        => $userId,
            'email'      => $email,
            'role'       => $role,
            'first_name' => $firstName,
            'avatar'     => $avatar,
        ], $this->jwtExpiry);
        $refreshToken = bin2hex(random_bytes(40));

        $this->user->saveRefreshToken($userId, $refreshToken, $this->refreshExpiry);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => $this->jwtExpiry,
        ];
    }

    /** Trả về user không có thông tin nhạy cảm */
    private function safeUser(array $user): array
    {
        // Chỉ trả về những trường tối thiểu frontend cần
        return [
            'id'         => $user['id'],
            'first_name' => $user['first_name'] ?? '',
            'last_name'  => $user['last_name']  ?? '',
            'email'      => $user['email'],
            'avatar'     => $user['avatar']     ?? null,
            'role'       => $user['role'],
        ];
        // Không trả về: password, google_id, is_locked, is_verified, created_at, updated_at
    }
}
