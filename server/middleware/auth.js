const jwt = require('jsonwebtoken');

// In-memory failed logins tracker
const failedLogins = new Map();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Erişim engellendi. Token bulunamadı.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Erişim engellendi. Geçersiz token formatı.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
}

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const limitTime = 15 * 60 * 1000; // 15 minutes

  if (failedLogins.has(ip)) {
    const record = failedLogins.get(ip);
    if (record.count >= 5) {
      if (now - record.lastAttempt < limitTime) {
        const remaining = Math.ceil((limitTime - (now - record.lastAttempt)) / 1000 / 60);
        return res.status(429).json({
          error: `Çok fazla başarısız giriş denemesi. Lütfen ${remaining} dakika sonra tekrar deneyin.`
        });
      } else {
        // Reset after window expires
        failedLogins.delete(ip);
      }
    }
  }
  next();
}

function recordFailedLogin(ip) {
  const now = Date.now();
  if (failedLogins.has(ip)) {
    const record = failedLogins.get(ip);
    record.count += 1;
    record.lastAttempt = now;
  } else {
    failedLogins.set(ip, { count: 1, lastAttempt: now });
  }
}

function resetFailedLogin(ip) {
  failedLogins.delete(ip);
}

module.exports = {
  verifyToken,
  loginRateLimiter,
  recordFailedLogin,
  resetFailedLogin
};
