<?php

// Autoloader dùng namespace path 
$AuthController           = 'App\\Http\\Controllers\\Auth\\AuthController';
$GoogleAuthController     = 'App\\Http\\Controllers\\Auth\\GoogleAuthController';
$AdminDashboardController = 'App\\Http\\Controllers\\Admin\\AdminDashboardController';
$AdminUserController      = 'App\\Http\\Controllers\\Admin\\AdminUserController';
$HskFileController        = 'App\\Http\\Controllers\\Admin\\HskFileController';
$HskSupplementController  = 'App\\Http\\Controllers\\Admin\\HskSupplementController';
$HskVocabController       = 'App\\Http\\Controllers\\Admin\\HskVocabController';
$HskLessonController      = 'App\\Http\\Controllers\\Admin\\HskLessonController';
$QuizController           = 'App\\Http\\Controllers\\Admin\\QuizController';

$router->post('/auth/register', $AuthController, 'register');
$router->post('/auth/login',    $AuthController, 'login');
$router->get('/auth/me',        $AuthController, 'me');
$router->post('/auth/logout',   $AuthController, 'logout');
$router->post('/auth/refresh',  $AuthController, 'refresh');
$router->get('/auth/google',          $GoogleAuthController, 'redirect');
$router->get('/auth/google/callback', $GoogleAuthController, 'callback');

// Admin Dashboard
$router->get('/admin/dashboard',         $AdminDashboardController, 'index');

// Admin User Management
$router->get('/admin/users',             $AdminUserController, 'index');
$router->put('/admin/users/{id}/role',   $AdminUserController, 'updateRole');
$router->delete('/admin/users/{id}',     $AdminUserController, 'destroy');

// ── HSK Lessons — Public ──────────────────────────────────────
$router->get('/hsk-lessons',                       $HskLessonController, 'publicIndex');

// ── HSK Lessons — Admin CRUD ──────────────────────────────────
// IMPORTANT: route tĩnh (/skill/{id}) phải đăng ký TRƯỚC route động ({id})
$router->put('/admin/hsk-lessons/skill/{id}',      $HskLessonController, 'updateSkill');
$router->get('/admin/hsk-lessons',                 $HskLessonController, 'index');
$router->post('/admin/hsk-lessons',                $HskLessonController, 'store');
$router->put('/admin/hsk-lessons/{id}',            $HskLessonController, 'update');
$router->delete('/admin/hsk-lessons/{id}',         $HskLessonController, 'destroy');

// HSK Files - Admin
$router->get('/admin/hsk-files',            $HskFileController, 'index');
$router->post('/admin/hsk-files',           $HskFileController, 'store');
$router->post('/admin/hsk-files/link',      $HskFileController, 'storeLink');
$router->put('/admin/hsk-files/{id}',       $HskFileController, 'update');
$router->delete('/admin/hsk-files/{id}',    $HskFileController, 'destroy');

// HSK Files - Public
$router->get('/hsk-files',               $HskFileController, 'index');

// ── HSK Supplements — Tài liệu bổ sung ────────────────────────
// IMPORTANT: route tĩnh /link phải đăng ký TRƯỚC route động {id}
$router->post('/admin/hsk-supplements/link',      $HskSupplementController, 'storeLink');
$router->get('/admin/hsk-supplements',             $HskSupplementController, 'index');
$router->post('/admin/hsk-supplements',            $HskSupplementController, 'store');
$router->put('/admin/hsk-supplements/{id}',        $HskSupplementController, 'update');
$router->delete('/admin/hsk-supplements/{id}',     $HskSupplementController, 'destroy');

// Public: user xem tài liệu bổ sung
$router->get('/hsk-supplements',                   $HskSupplementController, 'publicIndex');
$router->get('/hsk-supplements/{id}/stream',       $HskSupplementController, 'stream');

// Video/File streaming - User truy cập file từ backend
$router->get('/hsk-files/{id}/stream', $HskFileController, 'stream');
$router->get('/videos',               $HskFileController, 'videos');

// ── HSK Vocab ────────────────────────────────────────────────
// Public: học viên lấy từ vựng của bài
$router->get('/hsk-vocab',                        $HskVocabController, 'index');

// Admin CRUD
$router->get('/admin/hsk-vocab',                  $HskVocabController, 'adminIndex');
$router->post('/admin/hsk-vocab',                 $HskVocabController, 'store');
$router->post('/admin/hsk-vocab/bulk',            $HskVocabController, 'bulk');
$router->delete('/admin/hsk-vocab/lesson',        $HskVocabController, 'deleteLesson');
$router->put('/admin/hsk-vocab/{id}',             $HskVocabController, 'update');
$router->delete('/admin/hsk-vocab/{id}',          $HskVocabController, 'destroy');

// ── Quiz — Admin CRUD ──────────────────────────────────────────
$router->get('/admin/quiz',            $QuizController, 'adminIndex');
$router->get('/admin/quiz/{id}',       $QuizController, 'adminShow');
$router->post('/admin/quiz',           $QuizController, 'store');
$router->put('/admin/quiz/{id}',       $QuizController, 'update');
$router->delete('/admin/quiz/{id}',    $QuizController, 'destroy');

// ── Quiz — User ──────────────────────────────────────────────
$router->get('/quiz/lessons',          $QuizController, 'lessons');
$router->get('/quiz/random',           $QuizController, 'random');
$router->post('/quiz/check-one',       $QuizController, 'checkOne');
$router->post('/quiz/submit',          $QuizController, 'submit');

// Khóa người dùng
$router->post('/admin/users/{id}/lock',    $AdminUserController, 'lockUser');