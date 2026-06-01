<?php
// 1. CONFIG ERROR
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Load ENV trước
function loadEnv(string $path): void
{
    if (!file_exists($path)) return;

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$name, $value] = explode('=', $line, 2);
        $name  = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        putenv("$name=$value");
        $_ENV[$name] = $value;
    }
}

loadEnv(__DIR__ . '../.env');

$env = $_ENV['APP_ENV'] ?? 'production';

// Error handler
set_error_handler(function ($errno, $errstr, $errfile, $errline) use ($env) {
    http_response_code(500);

    $response = [
        'success' => false,
        'message' => "PHP Error: $errstr"
    ];

    if ($env === 'development') {
        $response['debug'] = [
            'file' => $errfile,
            'line' => $errline
        ];
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
});

// Exception handler
set_exception_handler(function (Throwable $e) use ($env) {
    http_response_code(500);

    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];

    if ($env === 'development') {
        $response['debug'] = [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ];
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
});


// 2. AUTOLOAD

spl_autoload_register(function (string $class): void {
    $base = __DIR__ . '/../';
    $file = $base . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) require_once $file;
});



// 3. CORS

$allowedOrigin = $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*';

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 4. HELPERS
// Lấy JSON body
function getJsonInput(): array
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Lấy Bearer Token
function getBearerToken(): ?string
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) return null;

    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        return $matches[1];
    }

    return null;
}

// 5. ROUTER (HỖ TRỢ PARAM)
class Router
{
    private array $routes = [];

    public function get(string $path, string $controller, string $method): void
    {
        $this->routes[] = ['GET', $path, $controller, $method];
    }

    public function post(string $path, string $controller, string $method): void
    {
        $this->routes[] = ['POST', $path, $controller, $method];
    }

    public function put(string $path, string $controller, string $method): void
    {
        $this->routes[] = ['PUT', $path, $controller, $method];
    }

    public function delete(string $path, string $controller, string $method): void
    {
        $this->routes[] = ['DELETE', $path, $controller, $method];
    }

    private function sendError(int $code, string $message): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function dispatch($requestMethod, $requestUri)
    {
        $path = parse_url($requestUri, PHP_URL_PATH);
        $originalUri = $_SERVER['REDIRECT_URL'] ?? $_SERVER['REQUEST_URI'];
        $originalPath = parse_url($originalUri, PHP_URL_PATH);

        if (preg_match('#/api(/.*)?$#', $originalPath, $m)) {
            $path = $m[1] ?? '/';
        } else {
            if (preg_match('#/api(/.*)?$#', $path, $m)) {
                $path = $m[1] ?? '/';
            }
        }

        $path = '/' . trim($path, '/');

        foreach ($this->routes as [$method, $route, $controller, $action]) {

            $routePattern = preg_replace('#\{[^/]+\}#', '([^/]+)', $route);
            $routePattern = "#^" . trim($routePattern, '/') . "$#";

            if ($method === $requestMethod && preg_match($routePattern, trim($path, '/'), $matches)) {

                array_shift($matches); 

                if (!class_exists($controller)) {
                    $this->sendError(500, "Controller '$controller' không tồn tại.");
                }

                $instance = new $controller();

                if (!method_exists($instance, $action)) {
                    $this->sendError(500, "Method '$action' không tồn tại.");
                }

                call_user_func_array([$instance, $action], $matches);
                return;
            }
        }

        $this->sendError(404, "Route '$path' không tồn tại.");
    }
}


// 6. RUN APP
$router = new Router();

$routesFile = __DIR__ . '/../app/routes/api.php';

if (!file_exists($routesFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'File routes missing']);
    exit;
}

require_once $routesFile;

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
