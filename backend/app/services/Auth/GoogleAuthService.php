<?php

namespace App\Services\Auth;

use App\Models\LoginLog;
use App\Models\User;

class GoogleAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    private const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const USER_URL  = 'https://www.googleapis.com/oauth2/v3/userinfo';

    public function __construct()
    {
        $this->clientId     = $_ENV['GOOGLE_CLIENT_ID']     ?? '';
        $this->clientSecret = $_ENV['GOOGLE_CLIENT_SECRET'] ?? '';
        $this->redirectUri  = $_ENV['GOOGLE_REDIRECT_URI']  ?? '';
    }

    // ─── Bước 1: Tạo URL chuyển hướng đến Google ─────────────────────────────

    public function getAuthUrl(): string
    {
        // CSRF protection: lưu state vào session
        session_start();
        $state = bin2hex(random_bytes(16));
        $_SESSION['google_oauth_state'] = $state;

        $params = http_build_query([
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'response_type' => 'code',
            'scope'         => 'openid email profile',
            'access_type'   => 'offline',
            'state'         => $state,
            'prompt'        => 'select_account',
        ]);

        return self::AUTH_URL . '?' . $params;
    }

    // ─── Bước 2: Xử lý callback từ Google ────────────────────────────────────

    public function handleCallback(string $code, string $state): array
    {
        // Xác minh state chống CSRF
        session_start();
        $savedState = $_SESSION['google_oauth_state'] ?? '';
        unset($_SESSION['google_oauth_state']);

        if (!hash_equals($savedState, $state)) {
            return ['success' => false, 'message' => 'Yêu cầu không hợp lệ (state mismatch).'];
        }

        // Đổi code lấy access token
        $tokenData = $this->exchangeCodeForToken($code);
        if (!isset($tokenData['access_token'])) {
            return ['success' => false, 'message' => 'Không thể lấy token từ Google.'];
        }

        // Lấy thông tin user từ Google
        $googleUser = $this->getUserInfo($tokenData['access_token']);
        if (!isset($googleUser['sub'])) {
            return ['success' => false, 'message' => 'Không thể lấy thông tin người dùng từ Google.'];
        }

        return $this->findOrCreateUser($googleUser);
    }

    // ─── Tìm hoặc tạo user từ thông tin Google ───────────────────────────────

    private function findOrCreateUser(array $googleUser): array
    {
        $userModel = new User();
        $authService = new AuthService();

        $googleId = $googleUser['sub'];
        $email    = $googleUser['email'] ?? null;
        $avatar   = $googleUser['picture'] ?? null;

        // 1. Tìm bằng google_id
        $user = $userModel->findByGoogleId($googleId);

        // 2. Tìm bằng email (user đã đăng ký thường, cần liên kết)
        if (!$user && $email) {
            $user = $userModel->findByEmail($email);
            if ($user) {
                $userModel->linkGoogle($user['id'], $googleId, $avatar);
                $user = $userModel->findById($user['id']);
            }
        }

        // Khóa người dùng
        if ($user && (!empty($user['is_locked']) || ($user['status'] ?? '') === 'locked')) {
            return [
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.   '
            ];
        }

        // 3. Tạo user mới
        if (!$user) {
            $nameParts = explode(' ', $googleUser['name'] ?? 'Google User', 2);
            $userId = $userModel->create([
                'first_name'  => $nameParts[0],
                'email'       => $email,
                'password'    => null,   // không có password
                'google_id'   => $googleId,
                'avatar'      => $avatar,
                'is_verified' => 1,      // Google đã xác thực email
            ]);
            $user = $userModel->findById($userId);
        }

        $tokens = $authService->generateTokens($user['id'], $user['email'], $user['role'], $user['first_name'] ?? '', $user['avatar'] ?? null);

        // Ghi log đăng nhập qua Google
        (new LoginLog())->log($user['id']);

        // Chỉ trả về các trường an toàn
        $safeUser = [
            'id'         => $user['id'],
            'first_name' => $user['first_name'] ?? '',
            'last_name'  => $user['last_name']  ?? '',
            'email'      => $user['email'],
            'avatar'     => $user['avatar']     ?? null,
            'role'       => $user['role'],
        ];

        return array_merge(['success' => true, 'user' => $safeUser], $tokens);
    }

    // ─── HTTP helpers ─────────────────────────────────────────────────────────

    private function exchangeCodeForToken(string $code): array
    {
        return $this->post(self::TOKEN_URL, [
            'code'          => $code,
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri'  => $this->redirectUri,
            'grant_type'    => 'authorization_code',
        ]);
    }

    private function getUserInfo(string $accessToken): array
    {
        $ch = curl_init(self::USER_URL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer {$accessToken}"],
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return json_decode($result, true) ?? [];
    }

    private function post(string $url, array $data): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($data),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return json_decode($result, true) ?? [];
    }
}
