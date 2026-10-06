<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://adjpcreative.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

/* Load API key from server-side config (never committed to git) */
$config_file = __DIR__ . '/.env.php';
if (!file_exists($config_file)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server configuration missing']);
    exit;
}
require $config_file;

if (empty(RESEND_API_KEY)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'API key not configured']);
    exit;
}

/* Parse and sanitise input */
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    /* Fallback: try form-encoded POST */
    $body = $_POST;
}

$name    = trim(strip_tags($body['name']    ?? ''));
$email   = trim(strip_tags($body['email']   ?? ''));
$service = trim(strip_tags($body['service'] ?? ''));
$message = trim(strip_tags($body['message'] ?? ''));

/* Validate */
if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid email address']);
    exit;
}
if (strlen($message) < 20) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Message too short']);
    exit;
}

/* Build email HTML */
$service_line = $service ? "<p><strong>Service:</strong> " . htmlspecialchars($service) . "</p>" : '';
$html = "
<div style='font-family:sans-serif;max-width:600px;'>
  <h2 style='color:#2CB32E;'>New Contact Form Submission</h2>
  <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
  <p><strong>Email:</strong> <a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></p>
  {$service_line}
  <hr style='border:1px solid #eee;margin:16px 0;'>
  <p><strong>Message:</strong></p>
  <p style='white-space:pre-wrap;'>" . htmlspecialchars($message) . "</p>
</div>
";

/* Send via Resend API */
$payload = json_encode([
    'from'    => 'ADJP Website <hello@adjpcreative.com>',
    'to'      => ['hello@adjpcreative.com'],
    'reply_to'=> $email,
    'subject' => 'New enquiry from ' . $name,
    'html'    => $html,
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . RESEND_API_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT        => 10,
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status === 200 || $status === 201) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Failed to send email']);
}
