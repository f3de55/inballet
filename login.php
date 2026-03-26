<?php
session_start();

// Password corretta
define('DASHBOARD_PASSWORD', 'Inb26&!alletdanza??!');

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Verifica login già effettuato
if (isset($_SESSION['dashboard_logged_in']) && $_SESSION['dashboard_logged_in'] === true) {
    header('Location: dashboard.php');
    exit;
}

// Gestione form
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';

    if ($password === DASHBOARD_PASSWORD) {
        $_SESSION['dashboard_logged_in'] = true;
        $_SESSION['dashboard_login_time'] = time();
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Password non corretta';
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Dashboard InBallet</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root{--primary:#87CEEB;--primary-dark:#5bb8e0;--bg:#0a0a0a;--bg-card:#141414;--text:#fff;--text-muted:#888;--danger:#f87171}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}

        .login-container{max-width:400px;width:100%}
        .login-logo{text-align:center;margin-bottom:2rem}
        .login-logo img{max-width:180px;height:auto;margin-bottom:1rem}
        .login-logo h1{font-size:1.5rem;color:var(--primary);margin-bottom:.5rem}
        .login-logo p{color:var(--text-muted);font-size:.9rem}

        .login-box{background:var(--bg-card);border-radius:16px;border:1px solid #222;padding:2rem}
        .form-group{margin-bottom:1.5rem}
        .form-group label{display:block;margin-bottom:.6rem;color:var(--text-muted);font-size:.9rem;font-weight:500}
        .form-group input{width:100%;padding:1rem 1.2rem;border-radius:10px;border:1px solid #333;background:#0a0a0a;color:var(--text);font-size:1rem;transition:all .2s}
        .form-group input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(135,206,235,.1)}

        .btn-login{width:100%;padding:1rem 1.5rem;border-radius:10px;border:none;background:var(--primary);color:#000;font-weight:600;font-size:1rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.6rem}
        .btn-login:hover{background:var(--primary-dark);transform:translateY(-1px)}
        .btn-login:active{transform:translateY(0)}

        .error{background:rgba(248,113,113,.15);color:var(--danger);padding:.8rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:.9rem;display:flex;align-items:center;gap:.6rem;border:1px solid rgba(248,113,113,.3)}

        .login-footer{text-align:center;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #222}
        .login-footer a{color:var(--text-muted);text-decoration:none;font-size:.85rem;display:inline-flex;align-items:center;gap:.5rem;transition:color .2s}
        .login-footer a:hover{color:var(--primary)}
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-logo">
            <img src="./assets/images/logo.png" alt="InBallet Logo">
            <h1>Dashboard Admin</h1>
            <p>Accedi per gestire il sito</p>
        </div>

        <div class="login-box">
            <?php if ($error): ?>
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <?= htmlspecialchars($error) ?>
            </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required autofocus placeholder="Inserisci la password">
                </div>

                <button type="submit" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i>
                    Accedi
                </button>
            </form>

            <div class="login-footer">
                <a href="index.html">
                    <i class="fas fa-arrow-left"></i>
                    Torna al sito
                </a>
            </div>
        </div>
    </div>
</body>
</html>
