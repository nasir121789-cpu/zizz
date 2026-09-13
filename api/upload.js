import https from 'https';

export const config = {
  api: {
    bodyParser: false, // Body পার্স করা বন্ধ রাখা হয়েছে যেন ফাইল সহজে স্ট্রিম হয়
    externalResolver: true, // Vercel-কে সিগন্যাল দেয় যে রেসপন্স ম্যানুয়ালি হ্যান্ডেল করা হবে
  },
};

export default function handler(req, res) {
  // CORS প্রিবিল্ড রিকোয়েস্ট হ্যান্ডেল করা
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const options = {
    hostname: 'catbox.moe',
    port: 443,
    path: '/user/api.php',
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'],
      'Content-Length': req.headers['content-length']
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // ক্লায়েন্ট সাইড রিকোয়েস্টের জন্য
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    if (!res.headersSent) {
      res.status(500).json({ error: e.message });
    }
  });

  req.on('error', (e) => {
    proxyReq.destroy();
  });

  // Client থেকে আসা ডেটা সরাসরি Catbox-এ স্ট্রিম করা হচ্ছে
  req.pipe(proxyReq);
}
