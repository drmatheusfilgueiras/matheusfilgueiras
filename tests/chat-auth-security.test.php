<?php
declare(strict_types=1);

putenv('CHAT_CONTROL_KEY_HASH=' . hash('sha256', 'example-only-for-ci-not-a-real-password'));
require __DIR__ . '/../public/api/_chat-auth.php';

if (!chat_admin_key_configured()) {
    fwrite(STDERR, "Configured hash was not detected.\n");
    exit(1);
}
if (!chat_admin_verify_key('example-only-for-ci-not-a-real-password')) {
    fwrite(STDERR, "Valid sample key was rejected.\n");
    exit(1);
}
if (chat_admin_verify_key('incorrect-key')) {
    fwrite(STDERR, "Incorrect key was accepted.\n");
    exit(1);
}
if (chat_admin_is_authorized()) {
    fwrite(STDERR, "Visitor without an admin cookie is considered authorized.\n");
    exit(1);
}
echo "Chat admin hash and initial authorization tests passed.\n";
